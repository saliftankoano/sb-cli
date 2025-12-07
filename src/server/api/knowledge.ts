import { Router } from "express";
import * as fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";
import { fileExists } from "../../utils/file-utils.js";
import { loadConfig } from "../../config/loader.js";

export interface KnowledgeFile {
  filePath: string;
  sourceFile: string;
  tags: string[];
  importance?: string;
  lastUpdated: string;
  content: {
    purpose?: string;
    gotchas?: string;
    dependencies?: string;
    architecture?: string;
    insights?: string;
    raw: string;
  };
}

/**
 * Recursively find all .md files in knowledge directory
 */
async function findKnowledgeFiles(
  dir: string,
  baseDir: string = dir
): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await findKnowledgeFiles(fullPath, baseDir)));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Ignore errors
  }
  return files;
}

/**
 * Parse knowledge file and extract sections
 */
function parseKnowledgeContent(content: string): KnowledgeFile["content"] {
  const sections: KnowledgeFile["content"] = {
    raw: content,
  };

  // Extract sections by markdown headers
  const purposeMatch = content.match(
    /##\s+Purpose\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
  );
  if (purposeMatch) {
    sections.purpose = purposeMatch[1].trim();
  }

  const gotchasMatch = content.match(
    /##\s+Gotchas\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
  );
  if (gotchasMatch) {
    sections.gotchas = gotchasMatch[1].trim();
  }

  const depsMatch = content.match(
    /##\s+Dependencies\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
  );
  if (depsMatch) {
    sections.dependencies = depsMatch[1].trim();
  }

  const archMatch = content.match(
    /##\s+Architecture\s+Context\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
  );
  if (archMatch) {
    sections.architecture = archMatch[1].trim();
  }

  const insightsMatch = content.match(
    /##\s+(?:Developer\s+)?Insights\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
  );
  if (insightsMatch) {
    sections.insights = insightsMatch[1].trim();
  }

  return sections;
}

export function setupKnowledgeRoutes(repoRoot: string): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const config = await loadConfig(repoRoot);
      const knowledgeDir = path.join(repoRoot, config.output.knowledgeDir);

      if (!(await fileExists(knowledgeDir))) {
        return res.json([]);
      }

      const knowledgeFiles = await findKnowledgeFiles(knowledgeDir);
      const results: KnowledgeFile[] = [];

      for (const filePath of knowledgeFiles) {
        try {
          const content = await fs.readFile(filePath, "utf-8");
          const { data, content: markdown } = matter(content);

          // Extract source file path from knowledge file path
          // knowledge/src/utils/intro.ts.md -> src/utils/intro.ts
          const relativePath = path.relative(knowledgeDir, filePath);
          const sourceFile = relativePath.replace(/\.md$/, "");

          results.push({
            filePath: relativePath,
            sourceFile,
            tags: (data.tags as string[]) || [],
            importance: data.importance as string | undefined,
            lastUpdated:
              (data.lastUpdated as string) || new Date().toISOString(),
            content: parseKnowledgeContent(markdown),
          });
        } catch (error) {
          // Skip files that can't be parsed
          console.error(`Error parsing ${filePath}:`, error);
        }
      }

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/:filePath(*)", async (req, res) => {
    try {
      const config = await loadConfig(repoRoot);
      const knowledgeDir = path.join(repoRoot, config.output.knowledgeDir);
      const filePath = path.join(knowledgeDir, req.params.filePath);

      // Security: ensure file is within knowledge directory
      const resolvedPath = path.resolve(filePath);
      const resolvedKnowledgeDir = path.resolve(knowledgeDir);
      if (!resolvedPath.startsWith(resolvedKnowledgeDir)) {
        return res.status(403).json({ error: "Invalid file path" });
      }

      if (!(await fileExists(filePath))) {
        return res.status(404).json({ error: "File not found" });
      }

      const content = await fs.readFile(filePath, "utf-8");
      const { data, content: markdown } = matter(content);

      const relativePath = path.relative(knowledgeDir, filePath);
      const sourceFile = relativePath.replace(/\.md$/, "");

      res.json({
        filePath: relativePath,
        sourceFile,
        tags: (data.tags as string[]) || [],
        importance: data.importance as string | undefined,
        lastUpdated: (data.lastUpdated as string) || new Date().toISOString(),
        content: parseKnowledgeContent(markdown),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
