import { Router } from "express";
import * as fs from "fs/promises";
import * as path from "path";
import { readFeaturesManifest } from "../../core/features.js";

export function setupFeaturesRoutes(repoRoot: string): Router {
  const router = Router();

  // Get all features
  router.get("/", async (req, res) => {
    try {
      const manifest = await readFeaturesManifest(repoRoot);
      res.json(manifest || { features: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get onboarding docs list
  router.get("/onboarding", async (req, res) => {
    const onboardingDir = path.join(repoRoot, ".startblock", "onboarding");
    try {
      await fs.access(onboardingDir);
      const files = await fs.readdir(onboardingDir);
      const docs = files.filter((f) => f.endsWith(".md"));

      // Order docs: INDEX, SETUP, ARCHITECTURE, FEATURES, TASKS, RESOURCES
      const order = [
        "INDEX.md",
        "SETUP.md",
        "ARCHITECTURE.md",
        "FEATURES.md",
        "TASKS.md",
        "RESOURCES.md",
      ];
      docs.sort((a, b) => {
        const idxA = order.indexOf(a);
        const idxB = order.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });

      res.json({ docs });
    } catch {
      res.json({ docs: [] });
    }
  });

  // Get specific onboarding doc content
  router.get("/onboarding/:filename", async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(repoRoot, ".startblock", "onboarding", filename);

    // Security check to prevent directory traversal
    if (
      !filePath.startsWith(path.join(repoRoot, ".startblock", "onboarding"))
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    try {
      const content = await fs.readFile(filePath, "utf-8");
      res.json({ content });
    } catch {
      res.status(404).json({ error: "File not found" });
    }
  });

  return router;
}
