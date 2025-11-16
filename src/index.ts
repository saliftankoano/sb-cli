#!/usr/bin/env node

import chalk from "chalk";
import { initCommand } from "./commands/init.js";
import { analyzeCommitCommand } from "./commands/analyze-commit.js";
import { simulateIntroCommand } from "./commands/simulate-intro.js";

const args = process.argv.slice(2);
const command = args[0];

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
      chalk.cyan("sb analyze-commit") +
      "  Analyze staged files (used by Husky hook)"
  );
  console.log(
    "  " + chalk.cyan("sb sim-intro") + "         Simulate the intro animation"
  );
  console.log(
    "  " + chalk.cyan("sb --help") + "          Show this help message\n"
  );
  console.log("Examples:");
  console.log("  " + chalk.dim("cd your-project"));
  console.log("  " + chalk.dim("sb init"));
  console.log(
    "  " + chalk.dim('git commit -m "feat: new feature"  # Auto-analyzes!')
  );
  console.log();
}

main();
