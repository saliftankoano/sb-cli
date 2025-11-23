import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as readline from "readline";
import { createSpinner } from "nanospinner";
import { ensureDir, fileExists } from "../utils/file-utils.js";
import {
  showIntro,
  breathingText,
  successMessage,
  infoMessage,
  promptMessage,
} from "../utils/intro.js";
import { setupOnboardingCommand } from "./setup-onboarding.js";

const execAsync = promisify(exec);

/**
 * Prompt user for input
 * Handles long API keys that might be pasted
 */
function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      // Trim and remove any extra whitespace/newlines
      const cleaned = answer.trim().replace(/\s+/g, "");
      resolve(cleaned);
    });
  });
}

const CONFIG_EXAMPLE = `{
  "openai": {
    "apiKey": "YOUR_API_KEY_HERE",
    "model": "gpt-4o-mini",
    "temperature": 0.3,
    "maxTokens": 2000
  },
  "analysis": {
    "excludePatterns": [
      "node_modules/**",
      "dist/**",
      "build/**",
      "*.test.ts",
      "*.test.js",
      "*.spec.ts",
      "*.spec.js",
      "__tests__/**",
      "coverage/**"
    ],
    "fileExtensions": [".ts", ".js", ".tsx", ".jsx", ".py", ".go", ".rs"],
    "includeDependencies": true,
    "maxFilesPerAnalysis": 10
  },
  "output": {
    "knowledgeDir": ".startblock/knowledge"
  }
}`;

/**
 * Generate config with the user provided API key
 */
function generateConfig(apiKey: string): string {
  const config = JSON.parse(CONFIG_EXAMPLE);
  config.openai.apiKey = apiKey;
  return JSON.stringify(config, null, 2);
}

const HUSKY_PRE_COMMIT = `#!/usr/bin/env sh
# Run sb analyze on staged files
sb analyze-commit
`;

/**
 * Initialize Startblock in current repository
 */
export async function initCommand(): Promise<void> {
  const repoRoot = process.cwd();

  // Show vibrant intro
  await showIntro();

  const spinner = createSpinner(
    breathingText("Initializing StartBlock...")
  ).start();

  try {
    // 1. Create .startblock directory
    spinner.update({ text: breathingText("Creating knowledge directory...") });
    const startblockDir = path.join(repoRoot, ".startblock");
    const knowledgeDir = path.join(startblockDir, "knowledge");

    await ensureDir(knowledgeDir);
    spinner.success({
      text: successMessage("Created .startblock/knowledge directory"),
    });

    // 2. Prompt for OpenAI API key
    spinner.stop();
    console.log("\n");
    console.log(
      infoMessage("To capture knowledge, we need your OpenAI API key.")
    );
    console.log(
      chalk.dim("  Get one at: https://platform.openai.com/api-keys\n")
    );

    const apiKey = await promptUser(
      promptMessage("Enter your OpenAI API key (or press Enter to skip): ")
    );

    // 3. Create config files
    spinner.start();
    spinner.update({ text: breathingText("Setting up configuration...") });

    const configPath = path.join(repoRoot, ".sb-config.json");
    const configExamplePath = path.join(repoRoot, ".sb-config.example.json");

    if (apiKey && apiKey.startsWith("sk-")) {
      // Create actual config with API key
      const configContent = generateConfig(apiKey);
      await fs.writeFile(configPath, configContent, "utf-8");

      // Verify the key was saved correctly
      const savedConfig = await fs.readFile(configPath, "utf-8");
      const parsedConfig = JSON.parse(savedConfig);
      const keySaved = parsedConfig.openai?.apiKey === apiKey;

      if (keySaved) {
        spinner.success({
          text: successMessage("Created .sb-config.json with your API key"),
        });
        // Confirm key was saved (show first/last chars for verification)
        const keyPreview = `${apiKey.substring(0, 7)}...${apiKey.substring(
          apiKey.length - 4
        )}`;
        console.log(chalk.dim(`  ✓ Key saved: ${keyPreview}`));
      } else {
        spinner.stop();
        console.log(
          chalk.red(
            "\n❌ Error: API key was not saved correctly. Please try again."
          )
        );
        spinner.start();
        await fs.writeFile(configPath, CONFIG_EXAMPLE, "utf-8");
        spinner.success({
          text: successMessage("Created .sb-config.json template"),
        });
        console.log(
          chalk.dim(
            '  → Please edit .sb-config.json and add: "apiKey": "sk-your-key"'
          )
        );
      }
    } else if (apiKey) {
      spinner.stop();
      console.log(
        chalk.yellow(
          "\n⚠ Invalid API key format (should start with 'sk-'). Skipped."
        )
      );
      console.log(
        chalk.dim(
          '  You can add it manually to .sb-config.json: "apiKey": "sk-..."'
        )
      );
      // Create config without real key
      await fs.writeFile(configPath, CONFIG_EXAMPLE, "utf-8");
      spinner.start();
      spinner.success({
        text: successMessage("Created .sb-config.json template"),
      });
    } else {
      spinner.stop();
      console.log(
        chalk.yellow("\n⚠ No API key provided. You'll need to add it later.")
      );
      // Create config without real key
      await fs.writeFile(configPath, CONFIG_EXAMPLE, "utf-8");
      spinner.start();
      spinner.success({
        text: successMessage("Created .sb-config.json template"),
      });
      console.log(chalk.dim('  → Edit it and add: "apiKey": "sk-your-key"'));
    }

    // Create example config for team sharing
    spinner.update({ text: breathingText("Creating team template...") });
    await fs.writeFile(configExamplePath, CONFIG_EXAMPLE, "utf-8");
    spinner.success({
      text: successMessage("Created .sb-config.example.json (safe to commit)"),
    });

    // 5. Check if Husky is installed
    const packageJsonPath = path.join(repoRoot, "package.json");
    const hasPackageJson = await fileExists(packageJsonPath);

    if (!hasPackageJson) {
      spinner.stop();
      console.log(
        chalk.yellow("\n⚠ No package.json found. Skipping Husky setup.")
      );
      console.log(
        chalk.dim(
          "  Run this command in a Node.js project to enable automatic analysis."
        )
      );
      spinner.start();
    } else {
      // Install Husky
      spinner.update({ text: breathingText("Setting up Husky hooks...") });
      try {
        await execAsync("npm install --save-dev husky", { cwd: repoRoot });
        spinner.success({ text: successMessage("Installed Husky") });

        spinner.start();
        spinner.update({ text: breathingText("Initializing Husky...") });
        await execAsync("npx husky init", { cwd: repoRoot });
        spinner.success({ text: successMessage("Initialized Husky") });

        // Create pre-commit hook
        spinner.start();
        spinner.update({
          text: breathingText("Creating pre-commit hook..."),
        });
        const huskyDir = path.join(repoRoot, ".husky");
        const preCommitPath = path.join(huskyDir, "pre-commit");

        await fs.writeFile(preCommitPath, HUSKY_PRE_COMMIT, "utf-8");
        await fs.chmod(preCommitPath, 0o755); // Make executable

        spinner.success({
          text: successMessage("Created pre-commit hook"),
        });
      } catch (error: any) {
        spinner.stop();
        console.log(chalk.yellow("⚠ Husky setup failed:"), error.message);
        console.log(chalk.dim("  You can set it up manually later."));
        spinner.start();
      }
    }

    // 4. Update .gitignore to protect API key
    spinner.start();
    spinner.update({ text: breathingText("Securing your API key...") });
    const gitignorePath = path.join(repoRoot, ".gitignore");
    if (await fileExists(gitignorePath)) {
      const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
      const entriesToAdd: string[] = [];

      // Ignore actual config with API key, but not the example
      if (!gitignoreContent.includes(".sb-config.json")) {
        entriesToAdd.push(".sb-config.json");
      }
      if (!gitignoreContent.includes(".startblock/.sb-cache")) {
        entriesToAdd.push(".startblock/.sb-cache/");
      }

      if (entriesToAdd.length > 0) {
        await fs.appendFile(
          gitignorePath,
          `\n# Startblock\n${entriesToAdd.join("\n")}\n`
        );
        spinner.success({ text: successMessage("Updated .gitignore") });
      } else {
        spinner.stop();
      }
    } else {
      // Create .gitignore if it doesn't exist
      await fs.writeFile(
        gitignorePath,
        "# Startblock\n.sb-config.json\n.startblock/.sb-cache/\n"
      );
      spinner.success({ text: successMessage("Created .gitignore") });
    }

    // Setup automatic onboarding if package.json exists
    if (hasPackageJson) {
      spinner.stop();
      try {
        await setupOnboardingCommand();
      } catch (error: any) {
        console.log(chalk.yellow("⚠ Onboarding setup skipped:"), error.message);
        console.log(
          chalk.dim("  You can run 'sb setup-onboarding' manually later.")
        );
      }
      spinner.start();
    }

    // Success message
    spinner.stop();
    console.log("\n");
    console.log(breathingText("✨ Initialization complete! ✨"));
    console.log("\n");

    if (apiKey && apiKey.startsWith("sk-")) {
      console.log(infoMessage("You're all set! Next steps:"));
      console.log(chalk.cyan("\n  1. Commit some code:"));
      console.log(
        chalk.dim('     git add . && git commit -m "feat: new feature"')
      );
      console.log(
        infoMessage("\n  2. Answer a few questions about your changes")
      );
      console.log(
        breathingText("  3. Knowledge is automatically captured! 🎉\n")
      );
    } else {
      console.log(infoMessage("Next steps:"));
      console.log(chalk.cyan("  1. Add your OpenAI API key:"));
      console.log(chalk.dim("     Edit .sb-config.json"));
      console.log(chalk.dim('     Set "apiKey": "sk-your-key-here"'));
      console.log(chalk.cyan("\n  2. Commit some code:"));
      console.log(
        chalk.dim('     git add . && git commit -m "feat: new feature"')
      );
      console.log(
        infoMessage("\n  3. Answer a few questions about your changes")
      );
      console.log(
        breathingText("  4. Knowledge is automatically captured! 🎉\n")
      );
    }
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Initialization failed: ${error.message}\n`));
    process.exit(1);
  }
}
