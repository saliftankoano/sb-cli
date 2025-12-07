import { Router } from "express";
import * as fs from "fs/promises";
import * as path from "path";
import ignore from "ignore";
import { fileExists } from "../../utils/file-utils.js";
import { loadConfig } from "../../config/loader.js";
import type { SBConfig } from "../../config/defaults.js";

export interface TreeNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: TreeNode[];
  hasKnowledge?: boolean;
  importance?: string;
  tags?: string[];
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
 * Build tree structure from file paths
 */
function buildTree(
  files: string[],
  knowledgeMap: Map<string, { importance?: string; tags?: string[] }>
): TreeNode[] {
  const tree: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  for (const filePath of files) {
    const parts = filePath.split(path.sep);
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = currentPath ? path.join(currentPath, part) : part;
      const isFile = i === parts.length - 1;

      if (!nodeMap.has(fullPath)) {
        const node: TreeNode = {
          name: part,
          type: isFile ? "file" : "directory",
          path: fullPath,
        };

        if (isFile) {
          const knowledge = knowledgeMap.get(filePath);
          if (knowledge) {
            node.hasKnowledge = true;
            node.importance = knowledge.importance;
            node.tags = knowledge.tags;
          }
        }

        nodeMap.set(fullPath, node);

        if (currentPath === "") {
          tree.push(node);
        } else {
          const parent = nodeMap.get(currentPath);
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(node);
          }
        }
      }

      currentPath = fullPath;
    }
  }

  return tree;
}

export function setupTreeRoutes(repoRoot: string): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const config = await loadConfig(repoRoot);

      // Create ignore filter
      const ig = ignore();
      const gitignorePath = path.join(repoRoot, ".gitignore");
      if (await fileExists(gitignorePath)) {
        const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
        ig.add(gitignoreContent);
      }
      ig.add(config.analysis.excludePatterns);
      ig.add([".git", ".startblock", "node_modules", "dist", "build"]);

      // Collect all source files
      const sourceFiles: string[] = [];
      await collectSourceFiles(repoRoot, "", sourceFiles, config, ig);

      // Load knowledge files and create map
      const knowledgeMap = new Map<
        string,
        { importance?: string; tags?: string[] }
      >();
      const knowledgeDir = path.join(repoRoot, config.output.knowledgeDir);

      if (await fileExists(knowledgeDir)) {
        const knowledgeFiles = await fs.readdir(knowledgeDir, {
          recursive: true,
          withFileTypes: true,
        });

        for (const entry of knowledgeFiles) {
          if (entry.isFile() && entry.name.endsWith(".md")) {
            const knowledgePath = path.join(
              knowledgeDir,
              entry.path || entry.name
            );
            const relativePath = path.relative(knowledgeDir, knowledgePath);
            const sourceFile = relativePath.replace(/\.md$/, "");

            try {
              const content = await fs.readFile(knowledgePath, "utf-8");
              const matter = await import("gray-matter");
              const { data } = matter.default(content);
              knowledgeMap.set(sourceFile, {
                importance: data.importance,
                tags: data.tags,
              });
            } catch {
              // Skip files that can't be parsed
            }
          }
        }
      }

      // Build tree structure
      const tree = buildTree(sourceFiles, knowledgeMap);

      res.json({
        tree,
        totalFiles: sourceFiles.length,
        documentedFiles: knowledgeMap.size,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
