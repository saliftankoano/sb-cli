import chalk from "chalk";
import { analyzeCommit } from "../core/analyzer.js";

/**
 * Command to analyze staged files (called by Husky pre-commit hook)
 * Exits with code 1 if user aborts or analysis fails, blocking the commit
 */
export async function analyzeCommitCommand(): Promise<void> {
  try {
    await analyzeCommit();
    // Exit successfully only if analysis completed and user confirmed
    process.exit(0);
  } catch (error: any) {
    // If user aborted or there was an error, block the commit
    console.error(chalk.red(`\n❌ Analysis failed: ${error.message}\n`));
    process.exit(1); // Exit with 1 to block commit
  }
}
