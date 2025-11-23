import chalk from "chalk";
import * as path from "path";
import { createSpinner } from "nanospinner";
import {
  findPackageJson,
  updatePostinstallScript,
} from "../utils/package-json.js";
import { ensureDir } from "../utils/file-utils.js";

/**
 * Setup onboarding command - configures package.json postinstall script
 * This is meant to be run by maintainers/automation, not end users
 */
export async function setupOnboardingCommand(): Promise<void> {
  const repoRoot = process.cwd();
  const spinner = createSpinner("Setting up automatic onboarding...").start();

  try {
    // Find package.json
    spinner.update({ text: "Looking for package.json..." });
    const packageJsonPath = await findPackageJson(repoRoot);

    if (!packageJsonPath) {
      spinner.stop();
      console.log(
        chalk.yellow(
          "\n⚠️  No package.json found. This command requires a Node.js project."
        )
      );
      console.log(
        chalk.dim(
          "  Create a package.json file first, or run this command in a Node.js project directory."
        )
      );
      return;
    }

    // Update postinstall script
    spinner.update({ text: "Updating package.json..." });
    const wasUpdated = await updatePostinstallScript(packageJsonPath);

    if (!wasUpdated) {
      spinner.stop();
      console.log(
        chalk.dim(
          "\n✓ Postinstall script already configured for Startblock onboarding."
        )
      );
      return;
    }

    // Ensure .startblock directory exists
    spinner.update({ text: "Ensuring .startblock directory exists..." });
    const startblockDir = path.join(repoRoot, ".startblock");
    await ensureDir(startblockDir);

    spinner.success({
      text: chalk.green("✓ Startblock onboarding configured successfully!"),
    });

    console.log(
      chalk.cyan(
        "\n🧠 Startblock onboarding will now run automatically after npm install."
      )
    );
    console.log(
      chalk.dim("\n  The postinstall script has been added to package.json:")
    );
    console.log(chalk.dim('    "postinstall": "sb onboard || true"'));
    console.log(
      chalk.dim("\n  Onboarding will run once per repository clone.")
    );
  } catch (error: any) {
    spinner.error({ text: chalk.red(`Error: ${error.message}`) });
    throw error;
  }
}
