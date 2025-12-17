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
  repoRoot: string,
  options: { skipExistenceCheck?: boolean } = {}
): Promise<string[]> {
  const { skipExistenceCheck = false } = options;
  const ig = await createIgnoreFilter(repoRoot);

  // Add config exclude patterns
  ig.add(config.analysis.excludePatterns);

  // Check each file exists and matches criteria
  const validFiles: string[] = [];

  for (const file of files) {
    // Check ignore patterns
    if (ig.ignores(file)) {
      continue;
    }

    // Check file extension
    if (!matchesExtensions(file, config.analysis.fileExtensions)) {
      continue;
    }

    // Check file actually exists
    if (!skipExistenceCheck) {
      const fullPath = path.join(repoRoot, file);
      if (!(await fileExists(fullPath))) {
        console.warn(`⚠️  File selected by AI does not exist: ${file}`);
        continue;
      }
    }

    validFiles.push(file);
  }

  return validFiles;
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
