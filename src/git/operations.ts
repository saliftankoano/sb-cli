import simpleGit, { SimpleGit } from "simple-git";

export interface GitOperations {
  getStagedFiles(): Promise<string[]>;
  getFileHash(filePath: string): Promise<string | null>;
  getFileDiff(filePath: string): Promise<string | null>;
  addFiles(files: string[]): Promise<void>;
  getLastCommitMessage(): Promise<string>;
}

/**
 * Git operations wrapper using simple-git
 */
export function createGitOperations(
  repoPath: string = process.cwd()
): GitOperations {
  const git: SimpleGit = simpleGit(repoPath);

  return {
    /**
     * Get list of staged files
     */
    async getStagedFiles(): Promise<string[]> {
      try {
        const diff = await git.diff([
          "--cached",
          "--name-only",
          "--diff-filter=ACM",
        ]);
        return diff.split("\n").filter((line) => line.trim().length > 0);
      } catch (error) {
        console.error("Error getting staged files:", error);
        return [];
      }
    },

    /**
     * Get git hash for a file (for versioning)
     */
    async getFileHash(filePath: string): Promise<string | null> {
      try {
        const log = await git.log({ file: filePath, maxCount: 1 });
        return log.latest?.hash || null;
      } catch {
        return null;
      }
    },

    /**
     * Get diff for a staged file
     */
    async getFileDiff(filePath: string): Promise<string | null> {
      try {
        const diff = await git.diff(["--cached", filePath]);
        return diff || null;
      } catch {
        return null;
      }
    },

    /**
     * Stage files (add to git)
     */
    async addFiles(files: string[]): Promise<void> {
      try {
        await git.add(files);
      } catch (error) {
        console.error("Error staging files:", error);
      }
    },

    /**
     * Get the last commit message (for context)
     */
    async getLastCommitMessage(): Promise<string> {
      try {
        const log = await git.log({ maxCount: 1 });
        return log.latest?.message || "Recent changes";
      } catch {
        return "Recent changes";
      }
    },
  };
}
