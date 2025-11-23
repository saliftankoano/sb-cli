import * as fs from "fs/promises";
import * as path from "path";
import { fileExists } from "./file-utils.js";
import ignore from "ignore";
import type { SBConfig } from "../config/defaults.js";

export interface RepoSummary {
  structure: {
    topLevelDirs: string[];
    topLevelFiles: string[];
    fileCounts: Record<string, number>;
  };
  documentation: {
    readme?: string;
    docs: string[];
  };
  packageJson?: {
    name?: string;
    version?: string;
    description?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    engines?: Record<string, string>;
  };
  envExample?: {
    file: string;
    variables: Array<{ key: string; value?: string; comment?: string }>;
  };
  knowledgeFiles: Array<{
    path: string;
    sourceFile: string;
    importance?: string;
    tags?: string[];
  }>;
  allSourceFiles: string[];
}

/**
 * Build a comprehensive summary of the repository
 */
export async function buildRepoSummary(
  repoRoot: string,
  config: SBConfig
): Promise<RepoSummary> {
  const summary: RepoSummary = {
    structure: {
      topLevelDirs: [],
      topLevelFiles: [],
      fileCounts: {},
    },
    documentation: {
      docs: [],
    },
    knowledgeFiles: [],
    allSourceFiles: [],
  };

  // Create ignore filter
  const ig = ignore();
  const gitignorePath = path.join(repoRoot, ".gitignore");
  if (await fileExists(gitignorePath)) {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
    ig.add(gitignoreContent);
  }
  ig.add(config.analysis.excludePatterns);
  ig.add([".git", ".startblock", "node_modules", "dist", "build"]);

  // Read top-level directory
  const entries = await fs.readdir(repoRoot, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = entry.name;

    if (ig.ignores(relativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      summary.structure.topLevelDirs.push(relativePath);
    } else if (entry.isFile()) {
      summary.structure.topLevelFiles.push(relativePath);
    }
  }

  // Read README
  const readmePath = path.join(repoRoot, "README.md");
  if (await fileExists(readmePath)) {
    try {
      summary.documentation.readme = await fs.readFile(readmePath, "utf-8");
    } catch {
      // Ignore read errors
    }
  }

  // Read package.json
  const packageJsonPath = path.join(repoRoot, "package.json");
  if (await fileExists(packageJsonPath)) {
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(packageJsonContent);
      summary.packageJson = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        scripts: packageJson.scripts,
        dependencies: packageJson.dependencies,
        devDependencies: packageJson.devDependencies,
        engines: packageJson.engines,
      };
    } catch {
      // Ignore parse errors
    }
  }

  // Find and parse example env files
  const envExamplePatterns = [
    ".env.example",
    ".env.local.example",
    ".env.template",
    ".env.sample",
    "env.example",
  ];
  for (const pattern of envExamplePatterns) {
    const envExamplePath = path.join(repoRoot, pattern);
    if (await fileExists(envExamplePath)) {
      try {
        const envContent = await fs.readFile(envExamplePath, "utf-8");
        const variables = parseEnvFile(envContent);
        summary.envExample = {
          file: pattern,
          variables,
        };
        break; // Use first found
      } catch {
        // Ignore read errors
      }
    }
  }

  // Find docs directory
  const docsPath = path.join(repoRoot, "docs");
  if (await fileExists(docsPath)) {
    try {
      const docFiles = await collectDocFiles(docsPath, "docs", ig);
      summary.documentation.docs = docFiles;
    } catch {
      // Ignore errors
    }
  }

  // Collect all source files
  await collectSourceFiles(repoRoot, "", summary.allSourceFiles, config, ig);

  // Count files by extension
  for (const file of summary.allSourceFiles) {
    const ext = path.extname(file).toLowerCase();
    summary.structure.fileCounts[ext] =
      (summary.structure.fileCounts[ext] || 0) + 1;
  }

  // Load knowledge files if they exist
  const knowledgeDir = path.join(repoRoot, config.output.knowledgeDir);
  if (await fileExists(knowledgeDir)) {
    summary.knowledgeFiles = await collectKnowledgeFiles(
      knowledgeDir,
      config.output.knowledgeDir,
      repoRoot
    );
  }

  return summary;
}

/**
 * Parse environment file content and extract variables
 */
function parseEnvFile(content: string): Array<{
  key: string;
  value?: string;
  comment?: string;
}> {
  const variables: Array<{ key: string; value?: string; comment?: string }> =
    [];
  const lines = content.split("\n");
  let prevComment = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track standalone comments (for next variable)
    if (trimmed.startsWith("#") && trimmed.length > 1) {
      prevComment = trimmed.substring(1).trim();
      continue;
    }

    // Skip empty lines
    if (!trimmed) {
      prevComment = ""; // Reset comment if blank line
      continue;
    }

    // Match KEY=VALUE or KEY="VALUE" or KEY='VALUE' or KEY= (empty value)
    // Also handle KEY=VALUE # comment format
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      let comment = prevComment || "";

      // Extract inline comment (after #)
      const inlineCommentMatch = value.match(/^(.+?)\s+#\s+(.+)$/);
      if (inlineCommentMatch) {
        value = inlineCommentMatch[1].trim();
        comment = inlineCommentMatch[2].trim() || comment;
      }

      // Remove surrounding quotes but preserve the value
      value = value.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Only show example value if it's not empty and not a placeholder
      const showValue =
        value &&
        !value.match(/^(your-|your_|example|placeholder|xxx|xxx-|xxx_)/i);

      variables.push({
        key,
        value: showValue ? value : undefined,
        comment: comment || undefined,
      });

      prevComment = ""; // Reset after using
    } else {
      prevComment = ""; // Reset if line doesn't match pattern
    }
  }

  return variables;
}

/**
 * Collect documentation files
 */
async function collectDocFiles(
  dirPath: string,
  basePath: string,
  ig: ReturnType<typeof ignore>
): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const relativePath = path.join(basePath, entry.name);

      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        const subFiles = await collectDocFiles(
          path.join(dirPath, entry.name),
          relativePath,
          ig
        );
        files.push(...subFiles);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".md") ||
          entry.name.endsWith(".txt") ||
          entry.name.endsWith(".rst"))
      ) {
        files.push(relativePath);
      }
    }
  } catch {
    // Ignore errors
  }

  return files;
}

/**
 * Recursively collect source files
 */
async function collectSourceFiles(
  dirPath: string,
  relativeBase: string,
  files: string[],
  config: SBConfig,
  ig: ReturnType<typeof ignore>
): Promise<void> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const relativePath =
        relativeBase === "" ? entry.name : path.join(relativeBase, entry.name);

      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await collectSourceFiles(
          path.join(dirPath, entry.name),
          relativePath,
          files,
          config,
          ig
        );
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (config.analysis.fileExtensions.includes(ext)) {
          files.push(relativePath);
        }
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Collect knowledge files and their metadata
 */
async function collectKnowledgeFiles(
  dirPath: string,
  basePath: string,
  repoRoot: string
): Promise<
  Array<{
    path: string;
    sourceFile: string;
    importance?: string;
    tags?: string[];
  }>
> {
  const knowledgeFiles: Array<{
    path: string;
    sourceFile: string;
    importance?: string;
    tags?: string[];
  }> = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await collectKnowledgeFiles(
          fullPath,
          relativePath,
          repoRoot
        );
        knowledgeFiles.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        // Extract source file path from knowledge file path
        // knowledge/src/file.ts.md -> src/file.ts
        const sourceFile = relativePath
          .replace(basePath + "/", "")
          .replace(/\.md$/, "");

        // Try to read metadata
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const metadataMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (metadataMatch) {
            const metadataStr = metadataMatch[1];
            const importanceMatch = metadataStr.match(/importance:\s*(.+)/);
            const tagsMatch = metadataStr.match(/tags:\s*\[(.*?)\]/);

            knowledgeFiles.push({
              path: relativePath,
              sourceFile,
              importance: importanceMatch?.[1]?.trim(),
              tags: tagsMatch?.[1]
                ?.split(",")
                .map((t) => t.trim().replace(/['"]/g, "")),
            });
          } else {
            knowledgeFiles.push({
              path: relativePath,
              sourceFile,
            });
          }
        } catch {
          knowledgeFiles.push({
            path: relativePath,
            sourceFile,
          });
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return knowledgeFiles;
}

/**
 * Generate ASCII directory tree with files
 * @param files List of relative file paths
 * @param maxDepth Maximum depth to show (default 4)
 * @param includeLinks Whether to make file names Markdown links
 */
export function generateDirectoryTree(
  files: string[],
  maxDepth: number = 4,
  includeLinks: boolean = false
): string {
  interface TreeNode {
    [key: string]: TreeNode | null;
  }

  const tree: TreeNode = {};

  // Build tree structure
  for (const file of files) {
    const parts = file.split("/");
    let current = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      if (!current[dir]) {
        current[dir] = {};
      }
      current = current[dir] as TreeNode;
    }
    const filename = parts[parts.length - 1];
    current[filename] = null;
  }

  // Recursive function to build lines
  function buildLines(
    node: TreeNode,
    prefix: string = "",
    currentPath: string = "",
    depth: number = 0
  ): string[] {
    const lines: string[] = [];
    const entries = Object.keys(node).sort((a, b) => {
      const aIsDir = node[a] !== null;
      const bIsDir = node[b] !== null;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    for (let i = 0; i < entries.length; i++) {
      const key = entries[i];
      const isLast = i === entries.length - 1;
      const connector = isLast ? "└─ " : "├─ ";

      const newPath = currentPath ? path.join(currentPath, key) : key;

      let displayKey = key;
      if (node[key] === null && includeLinks) {
        // Generate relative path from .startblock/onboarding/ to the file
        // .startblock/onboarding/ -> repo root -> file
        const relativePath = path.posix.join("..", "..", newPath);
        // Use forward slashes for markdown links (works on all platforms)
        const normalizedPath = relativePath.replace(/\\/g, "/");
        // Show just filename as link text, path in href
        displayKey = `[${key}](${normalizedPath})`;
      }

      lines.push(`${prefix}${connector}${displayKey}`);

      if (node[key] !== null && depth < maxDepth) {
        const newPrefix = `${prefix}${isLast ? "   " : "│  "}`;
        lines.push(
          ...buildLines(node[key] as TreeNode, newPrefix, newPath, depth + 1)
        );
      } else if (node[key] !== null && depth >= maxDepth) {
        lines.push(
          `${prefix}${isLast ? "   " : "│  "}└─ ... (deeper levels omitted)`
        );
      }
    }
    return lines;
  }

  const lines = buildLines(tree);
  if (lines.length === 0) {
    return "No files found.";
  }
  return lines.join("\n");
}
