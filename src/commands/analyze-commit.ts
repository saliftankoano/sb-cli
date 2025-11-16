import chalk from "chalk";
import { analyzeCommit } from "../core/analyzer.js";

/**
 * Command to analyze staged files (called by Husky prepare-commit-msg hook)
 * Exits with code 1 if user aborts or analysis fails, blocking the commit
 * @param commitMsgFile - Path to the commit message file (passed by Git hook as $1)
 */
export async function analyzeCommitCommand(
  commitMsgFile?: string
): Promise<void> {
  try {
    await analyzeCommit(commitMsgFile);
    // Exit successfully only if analysis completed and user confirmed
    process.exit(0);
  } catch (error: any) {
    // If user aborted or there was an error, block the commit
    console.error(chalk.red(`\n❌ Analysis failed: ${error.message}\n`));
    process.exit(1); // Exit with 1 to block commit
  }
}
