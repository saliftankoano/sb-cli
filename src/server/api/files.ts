import { Router } from "express";
import * as fs from "fs/promises";
import * as path from "path";
import { fileExists } from "../../utils/file-utils.js";

export interface FileContentResponse {
  filePath: string;
  content: string;
  lines: string[];
  totalLines: number;
  startLine?: number;
  endLine?: number;
}

export function setupFilesRoutes(repoRoot: string): Router {
  const router = Router();

  /**
   * GET /api/files/:filePath
   * Query params:
   *   - startLine: number (1-indexed, inclusive)
   *   - endLine: number (1-indexed, inclusive)
   *
   * Returns file content, optionally limited to specific line range
   */
  router.get("/:filePath(*)", async (req, res) => {
    try {
      const filePath = path.join(repoRoot, req.params.filePath);

      // Security: ensure file is within repo root
      const resolvedPath = path.resolve(filePath);
      const resolvedRepoRoot = path.resolve(repoRoot);
      if (!resolvedPath.startsWith(resolvedRepoRoot)) {
        return res.status(403).json({ error: "Invalid file path" });
      }

      if (!(await fileExists(filePath))) {
        return res.status(404).json({ error: "File not found" });
      }

      const content = await fs.readFile(filePath, "utf-8");
      const allLines = content.split("\n");

      // Parse line range from query params
      const startLine = req.query.startLine
        ? parseInt(req.query.startLine as string, 10)
        : undefined;
      const endLine = req.query.endLine
        ? parseInt(req.query.endLine as string, 10)
        : undefined;

      let lines = allLines;
      let actualStart = 1;
      let actualEnd = allLines.length;

      if (startLine !== undefined && endLine !== undefined) {
        // Convert to 0-indexed for array slice
        actualStart = Math.max(1, startLine);
        actualEnd = Math.min(allLines.length, endLine);
        lines = allLines.slice(actualStart - 1, actualEnd);
      }

      // Format lines with line numbers
      const numberedLines = lines.map((line, i) => ({
        number: actualStart + i,
        content: line,
      }));

      res.json({
        filePath: req.params.filePath,
        content: lines.join("\n"),
        lines: numberedLines,
        totalLines: allLines.length,
        startLine: actualStart,
        endLine: actualEnd,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
