#!/usr/bin/env node

import chalk from "chalk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initCommand } from "./commands/init.js";
import { analyzeCommitCommand } from "./commands/analyze-commit.js";
import { simulateIntroCommand } from "./commands/simulate-intro.js";
import { onboardCommand } from "./commands/onboard.js";
import { setupOnboardingCommand } from "./commands/setup-onboarding.js";
import { migrateFeaturesCommand } from "./commands/migrate-features.js";

const args = process.argv.slice(2);
const command = args[0];

// Get version from package.json
function getVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packagePath = join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    return packageJson.version;
  } catch {
    return "unknown";
  }
}

async function main() {
  try {
    switch (command) {
      case "init":
        await initCommand();
        break;

      case "analyze-commit":
        // pre-commit hook doesn't pass any arguments
        await analyzeCommitCommand();
        break;

      case "sim-intro":
        await simulateIntroCommand();
        break;

      case "onboard":
        // Check if --postinstall flag is present
        const isPostinstall = args.includes("--postinstall");
        await onboardCommand(isPostinstall);
        break;

      case "setup-onboarding":
        await setupOnboardingCommand();
        break;

      case "serve":
        const { serveCommand } = await import("./commands/serve.js");
        await serveCommand();
        break;

      case "gitflash": {
        const { gitflashCommand } = await import("./commands/gitflash.js");
        await gitflashCommand();
        break;
      }

      case "migrate-features":
        await migrateFeaturesCommand();
        break;

      case "--version":
      case "-v":
        console.log(`v${getVersion()}`);
        break;

      case "--help":
      case "-h":
      case undefined:
        showHelp();
        break;

      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        showHelp();
        process.exit(1);
    }
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  }
}

function showHelp() {
  console.log(
    chalk.cyan.bold("\nsb-cli") +
      chalk.dim(" - Automatic knowledge capture for codebases\n")
  );
  console.log("Usage:");
  console.log(
    "  " +
      chalk.cyan("sb init") +
      "            Initialize Startblock in current repo"
  );
  console.log(
    "  " +
      chalk.cyan("sb onboard") +
      "          Run onboarding (analyzes repo and generates docs)"
  );
  console.log(
    "  " +
      chalk.cyan("sb setup-onboarding") +
      "  Configure automatic onboarding via npm postinstall"
  );
  console.log(
    "  " +
      chalk.cyan("sb analyze-commit") +
      "  Analyze staged files (used by Husky hook)"
  );
  console.log(
    "  " + chalk.cyan("sb sim-intro") + "         Simulate the intro animation"
  );
  console.log(
    "  " + chalk.cyan("sb serve") + "            Start visual onboarding server"
  );
  console.log(
    "  " +
      chalk.cyan("sb migrate-features") +
      " Migrate existing knowledge files to feature-based format"
  );
  console.log(
    "  " +
      chalk.cyan("sb gitflash --commits 50") +
      " Document historical commits with GitFlash"
  );
  console.log(
    "  " +
      chalk.cyan("sb gitflash --hash <SHA>") +
      "   Document a specific commit"
  );
  console.log(
    "  " +
      chalk.cyan("sb gitflash --all") +
      "       Document ALL commits (careful!)"
  );
  console.log(
    "  " + chalk.cyan("sb --help") + "          Show this help message"
  );
  console.log("  " + chalk.cyan("sb --version") + "       Show CLI version\n");
  console.log("Examples:");
  console.log("  " + chalk.dim("cd your-project"));
  console.log("  " + chalk.dim("sb init"));
  console.log(
    "  " + chalk.dim('git commit -m "feat: new feature"  # Auto-analyzes!')
  );
  console.log("  " + chalk.dim("sb onboard  # Start personalized onboarding"));
  console.log(
    "  " +
      chalk.dim("npm install  # Auto-onboards after install (if configured)")
  );
  console.log();
}

main();
