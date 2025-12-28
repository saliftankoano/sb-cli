import simpleGit, { type SimpleGit } from "simple-git";

export interface CommitInfo {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  message: string;
}

export type FileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "renamed"
  | "copied"
  | "unknown";

export interface ChangedFile {
  path: string;
  status: FileStatus;
  previousPath?: string;
}

export interface ChangedFiles {
  files: ChangedFile[];
}

export interface GitHistoryOperations {
  getLastNCommits(n: number): Promise<CommitInfo[]>;
  getCommit(hash: string): Promise<CommitInfo | null>;
  getFileAtCommit(hash: string, filePath: string): Promise<string | null>;
  getFileDiffInCommit(hash: string, filePath: string): Promise<string | null>;
  getChangedFilesInCommit(hash: string): Promise<ChangedFiles>;
  getAllCommits(): Promise<CommitInfo[]>;
}

export function createGitHistoryOperations(
  repoPath: string = process.cwd()
): GitHistoryOperations {
  const git: SimpleGit = simpleGit(repoPath);

  return {
    async getLastNCommits(n: number): Promise<CommitInfo[]> {
      const log = await git.log({ maxCount: n });
      return log.all.map((entry) => ({
        hash: entry.hash,
        shortHash: entry.hash.substring(0, 7),
        author: entry.author_name || "Unknown Author",
        date: entry.date,
        message: entry.message,
      }));
    },

    async getFileAtCommit(
      hash: string,
      filePath: string
    ): Promise<string | null> {
      try {
        const content = await git.show([`${hash}:${filePath}`]);
        return content;
      } catch {
        return null;
      }
    },

    async getFileDiffInCommit(
      hash: string,
      filePath: string
    ): Promise<string | null> {
      try {
        // Get diff between parent (hash^) and commit (hash) for specific file
        const diff = await git.raw(["diff", `${hash}^`, hash, "--", filePath]);
        return diff || null;
      } catch {
        return null;
      }
    },

    async getChangedFilesInCommit(hash: string): Promise<ChangedFiles> {
      try {
        const output = await git.raw([
          "diff-tree",
          "--no-commit-id",
          "--name-status",
          "-r",
          hash,
        ]);

        const files: ChangedFile[] = output
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [statusToken, ...paths] = line.split("\t");
            const statusChar = statusToken?.charAt(0) ?? "";
            const status = parseStatus(statusChar);

            if (status === "renamed" || status === "copied") {
              return {
                status,
                previousPath: paths[0] || "",
                path: paths[1] || paths[0] || "",
              };
            }

            return {
              status,
              path: paths[0] || "",
            };
          });

        return { files };
      } catch {
        return { files: [] };
      }
    },

    async getCommit(hash: string): Promise<CommitInfo | null> {
      try {
        const output = await git.raw([
          "show",
          "-s",
          "--format=%H%n%h%n%an%n%ad%n%s",
          hash,
        ]);

        const [fullHash, shortHash, author, date, ...messageParts] = output
          .split("\n")
          .filter(Boolean);

        if (!fullHash) {
          return null;
        }

        return {
          hash: fullHash,
          shortHash: shortHash || fullHash.substring(0, 7),
          author: author || "Unknown Author",
          date: date || "",
          message: messageParts.join("\n") || "",
        };
      } catch {
        return null;
      }
    },

    async getAllCommits(): Promise<CommitInfo[]> {
      const log = await git.log();
      return log.all.map((entry) => ({
        hash: entry.hash,
        shortHash: entry.hash.substring(0, 7),
        author: entry.author_name || "Unknown Author",
        date: entry.date,
        message: entry.message,
      }));
    },
  };
}

function parseStatus(token: string): FileStatus {
  switch (token) {
    case "A":
      return "added";
    case "M":
      return "modified";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    case "C":
      return "copied";
    default:
      return "unknown";
  }
}
