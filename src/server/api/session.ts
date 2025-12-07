import { Router } from "express";
import { readSession } from "../../utils/onboarding-session.js";

export function setupSessionRoutes(repoRoot: string): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const session = await readSession(repoRoot);
      if (!session) {
        return res.status(404).json({ error: "No session found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
