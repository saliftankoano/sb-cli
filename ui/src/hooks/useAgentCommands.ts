import { useCallback, useState, useEffect } from "react";
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import type { GuidedViewState } from "@/components/GuidedView";
import {
  fetchSession,
  fetchFeatures,
  fetchKnowledge,
  fetchFileContent,
} from "@/lib/api";

// Command types from agent
interface NavigateCommand {
  type: "navigate";
  to: string;
}

interface ShowFileCommand {
  type: "showFile";
  file: string;
  title: string;
  explanation: string;
  startLine?: number;
  endLine?: number;
  highlightLines?: number[];
  featureName?: string;
}

interface RequestFileCommand {
  type: "request-file";
  path: string;
  requestId: string;
}

type AgentCommand = NavigateCommand | ShowFileCommand | RequestFileCommand;

interface UseAgentCommandsReturn {
  guidedState: GuidedViewState | null;
  lastCommand: AgentCommand | null;
  clearGuidedState: () => void;
}

export function useAgentCommands(): UseAgentCommandsReturn {
  const [guidedState, setGuidedState] = useState<GuidedViewState | null>(null);
  const [lastCommand, setLastCommand] = useState<AgentCommand | null>(null);
  const room = useRoomContext();

  const { send } = useDataChannel("server-context");

  // Push initial context when agent joins
  useEffect(() => {
    console.warn("[ContextBridge] HOOK MOUNTED", {
      roomName: room.name,
      state: room.state,
      participantCount: room.remoteParticipants.size,
    });

    const sendContext = async (participant: any) => {
      console.warn(
        `[ContextBridge] Checking participant: ${participant.identity} | IsAgent?`
      );

      // Be very permissive with agent detection for now
      const isAgent =
        participant.identity.toLowerCase().includes("agent") ||
        participant.identity.toLowerCase().includes("python") ||
        participant.identity.toLowerCase().includes("participant") ||
        participant.identity.startsWith("PA_"); // LiveKit participant ID prefix

      if (isAgent) {
        console.warn(
          "[ContextBridge] TARGET AGENT DETECTED! Starting context push..."
        );
        try {
          const [session, features, knowledgeFiles] = await Promise.all([
            fetchSession(),
            fetchFeatures(),
            fetchKnowledge(),
          ]);

          console.log("[ContextBridge] Local data fetched", {
            hasSession: !!session,
          });

          if (session) {
            const knowledgeMap: Record<string, string> = {};
            knowledgeFiles.forEach((k) => {
              knowledgeMap[k.sourceFile] = k.content.raw;
            });

            let currentFile = undefined;
            if (session.selectedFiles.length > 0) {
              console.log(
                `[ContextBridge] Fetching content for first file: ${session.selectedFiles[0]}`
              );
              const fileData = await fetchFileContent(session.selectedFiles[0]);
              currentFile = {
                path: session.selectedFiles[0],
                content: fileData.content,
                knowledge: knowledgeMap[session.selectedFiles[0]],
                totalLines: fileData.totalLines,
              };
            }

            const context = {
              type: "onboarding-context",
              session,
              features: features.features,
              knowledgeFiles: knowledgeMap,
              currentFile,
            };

            const payload = new TextEncoder().encode(JSON.stringify(context));
            console.warn(
              `[ContextBridge] SENDING PAYLOAD to ${participant.identity}. Size: ${payload.length} bytes`
            );

            await send(payload, {
              reliable: true,
              destinationIdentities: [participant.identity],
            });
            console.warn("[ContextBridge] PUSH SUCCESSFUL");
          }
        } catch (err) {
          console.error("[ContextBridge] PUSH FAILED:", err);
        }
      } else {
        console.log(
          `[ContextBridge] Participant ${participant.identity} is not an agent, ignoring.`
        );
      }
    };

    // 1. Sync already present participants
    const existing = Array.from(room.remoteParticipants.values());
    console.log(
      `[ContextBridge] Existing participants count: ${existing.length}`
    );
    existing.forEach((p) => {
      sendContext(p);
    });

    // 2. Listen for future joins
    const onParticipantConnected = (participant: any) => {
      console.warn(
        `[ContextBridge] NEW PARTICIPANT JOINED: ${participant.identity}`
      );
      sendContext(participant);
    };

    room.on("participantConnected", onParticipantConnected);

    // 3. Periodic check for agent if connection events were missed
    const interval = setInterval(() => {
      const participants = Array.from(room.remoteParticipants.values());
      const agent = participants.find(
        (p) =>
          p.identity.toLowerCase().includes("agent") ||
          p.identity.toLowerCase().includes("python")
      );
      if (agent) {
        console.log(
          "[ContextBridge] Periodic check found agent",
          agent.identity
        );
        // sendContext is async, but we can call it here
        // We'll only send if we haven't successfully sent yet (could add a ref for that)
      }
    }, 5000);

    return () => {
      console.log("[ContextBridge] HOOK UNMOUNTED");
      room.off("participantConnected", onParticipantConnected);
      clearInterval(interval);
    };
  }, [room, send]);

  // Handle data received (requests from agent)
  const onMessage = useCallback(
    async (msg: any) => {
      try {
        const payload = msg.payload || msg;
        const text = new TextDecoder().decode(payload);
        const command = JSON.parse(text) as AgentCommand;

        console.log("[AgentCommand] Received:", command);
        setLastCommand(command);

        if (command.type === "showFile") {
          setGuidedState({
            file: command.file,
            title: command.title,
            explanation: command.explanation,
            startLine: command.startLine,
            endLine: command.endLine,
            highlightLines: command.highlightLines,
            featureName: command.featureName,
          });
        } else if (command.type === "request-file") {
          console.log("[ContextBridge] Agent requested file:", command.path);
          try {
            const fileData = await fetchFileContent(command.path);
            const response = {
              type: "file-content",
              requestId: command.requestId,
              path: command.path,
              content: fileData.content,
              totalLines: fileData.totalLines,
            };

            await send(new TextEncoder().encode(JSON.stringify(response)), {
              reliable: true,
            });
            console.log("[ContextBridge] Sent file content to agent");
          } catch (err) {
            console.error(
              "[ContextBridge] Failed to fetch requested file:",
              err
            );
          }
        }
      } catch (error) {
        console.error("[AgentCommand] Failed to parse:", error);
      }
    },
    [send]
  );

  // Listen for agent commands
  useDataChannel("agent-commands", onMessage);

  const clearGuidedState = useCallback(() => {
    setGuidedState(null);
  }, []);

  return {
    guidedState,
    lastCommand,
    clearGuidedState,
  };
}
