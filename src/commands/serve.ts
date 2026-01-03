import chalk from "chalk";
import * as path from "path";
import { fileExists } from "../utils/file-utils.js";
import { startServer } from "../server/index.js";
import { brandColor } from "../utils/intro.js";
import { loadConfig } from "../config/loader.js";

export interface ServeOptions {
  port?: number;
  noOpen?: boolean;
  noVoice?: boolean;
  livekitConfig?: {
    url?: string;
    apiKey?: string;
    apiSecret?: string;
  };
}

export async function serveCommand(): Promise<void> {
  const repoRoot = process.cwd();
  const startblockDir = path.join(repoRoot, ".startblock");

  // Validate .startblock directory exists
  if (!(await fileExists(startblockDir))) {
    console.error(
      chalk.red(
        "\n❌ Error: .startblock directory not found. Run 'sb init' first.\n"
      )
    );
    process.exit(1);
  }

  // Load config
  const config = await loadConfig(repoRoot);

  // Parse CLI flags
  const args = process.argv.slice(2);
  const portIndex = args.indexOf("--port");
  const port =
    portIndex !== -1 && args[portIndex + 1]
      ? parseInt(args[portIndex + 1], 10)
      : 3939;

  const noOpen = args.includes("--no-open");
  const noVoice = args.includes("--no-voice");

  const options: ServeOptions = {
    port,
    noOpen,
    noVoice,
    livekitConfig: config.livekit,
  };

  console.log(
    brandColor("\n🚀 Starting Startblock Visual Onboarding Server...\n")
  );

  try {
    await startServer(repoRoot, options);
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  }
}
