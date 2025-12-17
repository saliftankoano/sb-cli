import express, { type Express } from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
import open from "open";
import { createServer, type Server } from "http";
import { setupKnowledgeRoutes } from "./api/knowledge.js";
import { setupSessionRoutes } from "./api/session.js";
import { setupTreeRoutes } from "./api/tree.js";
import { setupNarrationRoutes } from "./api/narration.js";
import { setupLiveKitRoutes } from "./api/livekit.js";
import { setupFeaturesRoutes } from "./api/features.js";
import { setupFilesRoutes } from "./api/files.js";
import type { ServeOptions } from "../commands/serve.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function startServer(
  repoRoot: string,
  options: ServeOptions
): Promise<void> {
  const app: Express = express();
  const { port = 3939, noOpen = false, noVoice = false } = options;

  // CORS for development
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // JSON body parser
  app.use(express.json());

  // API routes
  app.use("/api/knowledge", setupKnowledgeRoutes(repoRoot));
  app.use("/api/session", setupSessionRoutes(repoRoot));
  app.use("/api/tree", setupTreeRoutes(repoRoot));
  app.use("/api/narration", setupNarrationRoutes(repoRoot, { noVoice }));
  app.use("/api/livekit", setupLiveKitRoutes(repoRoot));
  app.use("/api/features", setupFeaturesRoutes(repoRoot));
  app.use("/api/files", setupFilesRoutes(repoRoot));

  // Serve static UI files
  const uiDir = path.join(__dirname, "..", "..", "dist", "ui");
  app.use(express.static(uiDir));

  // Fallback to index.html for SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(uiDir, "index.html"));
  });

  // Create HTTP server
  const server: Server = createServer(app);

  // Start server
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log(chalk.green(`✓ Server running at ${chalk.cyan(url)}\n`));

      if (!noOpen) {
        open(url).catch(() => {
          console.log(chalk.dim("  (Could not open browser automatically)"));
        });
      }

      // Graceful shutdown with force timeout
      let isShuttingDown = false;
      const shutdown = () => {
        if (isShuttingDown) return; // Prevent multiple shutdowns
        isShuttingDown = true;

        console.log(chalk.dim("\n\nShutting down server..."));

        // Force exit after 2 seconds if graceful shutdown fails
        const forceExit = setTimeout(() => {
          console.log(chalk.dim("Force closing...\n"));
          process.exit(0);
        }, 2000);

        server.close(() => {
          clearTimeout(forceExit);
          console.log(chalk.dim("Server stopped.\n"));
          process.exit(0);
        });
      };

      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          chalk.red(
            `\n❌ Port ${port} is already in use. Try a different port with --port\n`
          )
        );
      } else {
        console.error(chalk.red(`\n❌ Server error: ${error.message}\n`));
      }
      reject(error);
    });
  });
}
