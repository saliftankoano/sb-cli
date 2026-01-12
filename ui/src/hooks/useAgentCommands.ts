import { useCallback, useState, useEffect } from "react";
import { useDataChannel, useRoomContext } from "@livekit/components-react";
import type { GuidedViewState } from "@/components/GuidedView";
import { fetchSession, fetchFeatures, fetchKnowledge, fetchFileContent } from "@/lib/api";

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

type AgentCommand =
  | NavigateCommand
  | ShowFileCommand
  | RequestFileCommand;

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
    const sendContext = async (participant: any) => {
      console.log(`[ContextBridge] Checking participant: ${participant.identity}`);
      if (participant.identity.toLowerCase().includes("agent") || participant.identity.toLowerCase().includes("python")) {
        console.log("[ContextBridge] Target agent detected. Preparing context...");
        try {
          const [session, features, knowledgeFiles] = await Promise.all([
            fetchSession(),
            fetchFeatures(),
            fetchKnowledge()
          ]);

          if (session) {
            const knowledgeMap: Record<string, string> = {};
            knowledgeFiles.forEach(k => {
              knowledgeMap[k.sourceFile] = k.content.raw;
            });

            let currentFile = undefined;
            if (session.selectedFiles.length > 0) {
              const fileData = await fetchFileContent(session.selectedFiles[0]);
              currentFile = {
                path: session.selectedFiles[0],
                content: fileData.content,
                knowledge: knowledgeMap[session.selectedFiles[0]],
                totalLines: fileData.totalLines
              };
            }

            const context = {
              type: "onboarding-context",
              session,
              features: features.features,
              knowledgeFiles: knowledgeMap,
              currentFile
            };

            const payload = new TextEncoder().encode(JSON.stringify(context));
            console.log(`[ContextBridge] Sending context to ${participant.identity} (Topic: server-context)...`);
            
            await send(payload, {
              reliable: true,
              destinationIdentities: [participant.identity]
            });
            console.log("[ContextBridge] Initial context sent successfully");
          }
        } catch (err) {
          console.error("[ContextBridge] Failed to send context:", err);
        }
      }
    };

    // 1. Check participants already in the room
    Array.from(room.remoteParticipants.values()).forEach(p => {
      console.log(`[ContextBridge] Found existing participant: ${p.identity}`);
      sendContext(p);
    });

    // 2. Listen for new joins
    const onParticipantConnected = (participant: any) => {
      console.log(`[ContextBridge] New participant joined: ${participant.identity}`);
      sendContext(participant);
    };

    room.on("participantConnected", onParticipantConnected);
    return () => {
      room.off("participantConnected", onParticipantConnected);
    };
  }, [room, send]);

  // Handle data received (requests from agent)
  const onMessage = useCallback(async (msg: any) => {
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
            totalLines: fileData.totalLines
          };
          
          await send(new TextEncoder().encode(JSON.stringify(response)), {
            reliable: true
          });
          console.log("[ContextBridge] Sent file content to agent");
        } catch (err) {
          console.error("[ContextBridge] Failed to fetch requested file:", err);
        }
      }
    } catch (error) {
      console.error("[AgentCommand] Failed to parse:", error);
    }
  }, [send]);

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
