import { useCallback, useState } from "react";
import { useDataChannel } from "@livekit/components-react";
import type { GuidedViewState } from "@/components/GuidedView";

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

interface ShowConnectionsCommand {
  type: "showConnections";
  file: string;
}

interface ExpandSectionCommand {
  type: "expandSection";
  file: string;
  section: "purpose" | "gotchas" | "history";
}

type AgentCommand =
  | NavigateCommand
  | ShowFileCommand
  | ShowConnectionsCommand
  | ExpandSectionCommand;

interface UseAgentCommandsReturn {
  guidedState: GuidedViewState | null;
  lastCommand: AgentCommand | null;
  clearGuidedState: () => void;
}

export function useAgentCommands(): UseAgentCommandsReturn {
  const [guidedState, setGuidedState] = useState<GuidedViewState | null>(null);
  const [lastCommand, setLastCommand] = useState<AgentCommand | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMessage = useCallback((msg: any) => {
    try {
      // msg can be { payload: Uint8Array } or just Uint8Array depending on version
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
      }
    } catch (error) {
      console.error("[AgentCommand] Failed to parse:", error);
    }
  }, []);

  // Listen for data channel messages on "agent-commands" topic
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
