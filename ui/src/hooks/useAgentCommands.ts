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
    const log = (message: string, data?: any) => {
      console.log(`[ContextBridge] ${message}`, data || "");
      fetch('http://127.0.0.1:7243/ingest/7bdaa666-6bb7-4671-81bb-23ccffbde6dd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'useAgentCommands.ts',
          message,
          data,
          timestamp: Date.now(),
          sessionId: 'debug-session',
          hypothesisId: 'H1'
        })
      }).catch(() => {});
    };

    const sendContext = async (participant: any) => {
      log(`Checking participant: ${participant.identity}`);
      const isAgent = participant.identity.toLowerCase().includes("agent") || 
                      participant.identity.toLowerCase().includes("python") ||
                      participant.identity.toLowerCase().includes("participant"); // Added participant as fallback
      
      if (isAgent) {
        log("Target agent detected. Preparing context...");
        try {
          log("Fetching local data (session, features, knowledge)...");
          const [session, features, knowledgeFiles] = await Promise.all([
            fetchSession(),
            fetchFeatures(),
            fetchKnowledge()
          ]);

          log("Data fetched successfully", { 
            hasSession: !!session, 
            featuresCount: features?.features?.length,
            knowledgeCount: knowledgeFiles?.length 
          });

          if (session) {
            const knowledgeMap: Record<string, string> = {};
            knowledgeFiles.forEach(k => {
              knowledgeMap[k.sourceFile] = k.content.raw;
            });

            let currentFile = undefined;
            if (session.selectedFiles.length > 0) {
              log(`Fetching content for first file: ${session.selectedFiles[0]}`);
              const fileData = await fetchFileContent(session.selectedFiles[0]);
              currentFile = {
                path: session.selectedFiles[0],
                content: fileData.content,
                knowledge: knowledgeMap[session.selectedFiles[0]],
                totalLines: fileData.totalLines
              };
              log("File content fetched");
            }

            const context = {
              type: "onboarding-context",
              session,
              features: features.features,
              knowledgeFiles: knowledgeMap,
              currentFile
            };

            const payload = new TextEncoder().encode(JSON.stringify(context));
            log(`Sending context to ${participant.identity} (Topic: server-context). Size: ${payload.length} bytes`);
            
            await send(payload, {
              reliable: true,
              destinationIdentities: [participant.identity]
            });
            log("Initial context sent successfully");
          } else {
            log("No session found, skipping context send");
          }
        } catch (err) {
          log("Failed to send context", { error: err instanceof Error ? err.message : String(err) });
        }
      } else {
        log(`Participant ${participant.identity} ignored (not an agent)`);
      }
    };

    // 1. Check participants already in the room
    const existing = Array.from(room.remoteParticipants.values());
    log(`Syncing existing participants (${existing.length})`);
    existing.forEach(p => {
      sendContext(p);
    });

    // 2. Listen for new joins
    const onParticipantConnected = (participant: any) => {
      log(`New participant connected: ${participant.identity}`);
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
