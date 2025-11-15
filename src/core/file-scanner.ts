import ignore from "ignore";
import * as fs from "fs/promises";
import * as path from "path";
import { fileExists, matchesExtensions } from "../utils/file-utils.js";
import type { SBConfig } from "../config/defaults.js";

/**
 * Create ignore filter from .gitignore
 */
export async function createIgnoreFilter(
  repoRoot: string
): Promise<ReturnType<typeof ignore>> {
  const gitignorePath = path.join(repoRoot, ".gitignore");
  const ig = ignore();

  if (await fileExists(gitignorePath)) {
    const content = await fs.readFile(gitignorePath, "utf-8");
    ig.add(content);
  }

  return ig;
}

/**
 * Filter files based on configuration
 */
export async function filterRelevantFiles(
  files: string[],
  config: SBConfig,
  repoRoot: string
): Promise<string[]> {
  const ig = await createIgnoreFilter(repoRoot);

  // Add config exclude patterns
  ig.add(config.analysis.excludePatterns);

  return files.filter((file) => {
    // Check ignore patterns
    if (ig.ignores(file)) {
      return false;
    }

    // Check file extension
    if (!matchesExtensions(file, config.analysis.fileExtensions)) {
      return false;
    }

    return true;
  });
}

/**
 * Get language from file extension
 */
export function getLanguageFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  const langMap: Record<string, string> = {
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".py": "python",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".rb": "ruby",
  };

  return langMap[ext] || "unknown";
}
