import { analyzeCommit } from '../core/analyzer.js';

/**
 * Command to analyze staged files (called by Husky pre-commit hook)
 */
export async function analyzeCommitCommand(): Promise<void> {
  try {
    await analyzeCommit();
    process.exit(0); // Always exit successfully (never block commits)
  } catch (error: any) {
    // Log error but don't block the commit
    console.error('Error during analysis:', error.message);
    console.error('(Commit will proceed anyway)');
    process.exit(0); // Exit with 0 to allow commit
  }
}

