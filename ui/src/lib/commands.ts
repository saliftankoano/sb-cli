/**
 * UI command types for agent-to-frontend communication.
 */

export type UICommand =
  | NavigateCommand
  | ShowConnectionsCommand
  | ExpandSectionCommand
  | HighlightCodeCommand
  | OpenSidebarCommand;

export interface NavigateCommand {
  type: "navigate";
  to: "next" | "previous" | string;
}

export interface ShowConnectionsCommand {
  type: "showConnections";
  file: string;
}

export interface ExpandSectionCommand {
  type: "expandSection";
  file: string;
  section: "purpose" | "gotchas" | "history";
}

export interface HighlightCodeCommand {
  type: "highlightCode";
  file: string;
  lines: [number, number];
}

export interface OpenSidebarCommand {
  type: "openSidebar";
}




