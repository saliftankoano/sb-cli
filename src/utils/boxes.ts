import boxen from "boxen";

/**
 * Styled boxes for CLI UI using boxen
 * Centralized box configurations for consistent styling
 */

/**
 * Analysis context box - shows commit info and file counts
 */
export function analysisContextBox(
  stagedCount: number,
  analyzedCount: number
): string {
  return boxen(
    `⏳ Preparing commit...\n\n${stagedCount} file(s) staged, ${analyzedCount} source file(s) analyzed`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "#3b82f6",
      title: "Analysis Context",
      titleAlignment: "left",
    }
  );
}

/**
 * Wizard prompt box - asks for developer insights
 */
export function wizardPromptBox(): string {
  return boxen(
    "✨ Oh great wizard, share your secrets!\nAny gotchas, tricky choices, or surprises for future devs?",
    {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "#a855f7",
      textAlignment: "center",
    }
  );
}

/**
 * Ready to commit box - final confirmation message
 */
export function readyToCommitBox(knowledgeFileCount: number): string {
  return boxen(`📚 ${knowledgeFileCount} knowledge file(s) ready to commit!`, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: "round",
    borderColor: "#10b981",
    textAlignment: "center",
  });
}
