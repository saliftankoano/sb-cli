import { cosmiconfig } from "cosmiconfig";
import { defaultConfig, type SBConfig } from "./defaults.js";
import chalk from "chalk";
import * as path from "path";
import * as fs from "fs/promises";

/**
 * Load configuration from various sources
 * Searches for: .sb-config.json, .sb-config.js, package.json (sb field)
 * @param searchPath Optional path to search from (defaults to process.cwd())
 */
export async function loadConfig(searchPath?: string): Promise<SBConfig> {
  const explorer = cosmiconfig("sb");
  const startDir = searchPath || process.cwd();

  try {
    // First, try to explicitly load .sb-config.json from the search path
    const explicitConfigPath = path.join(startDir, ".sb-config.json");
    try {
      const configContent = await fs.readFile(explicitConfigPath, "utf-8");
      const config = JSON.parse(configContent);
      return {
        ...defaultConfig,
        ...config,
        openai: {
          ...defaultConfig.openai,
          ...config.openai,
        },
        analysis: {
          ...defaultConfig.analysis,
          ...config.analysis,
        },
        output: {
          ...defaultConfig.output,
          ...config.output,
        },
      };
    } catch (explicitError) {
      // File doesn't exist or can't be read, fall back to cosmiconfig search
    }

    // Fall back to cosmiconfig search (searches upward from startDir)
    const result = await explorer.search(startDir);

    let config: SBConfig;

    if (result) {
      // Merge with defaults
      config = {
        ...defaultConfig,
        ...result.config,
        openai: {
          ...defaultConfig.openai,
          ...result.config.openai,
        },
        analysis: {
          ...defaultConfig.analysis,
          ...result.config.analysis,
        },
        output: {
          ...defaultConfig.output,
          ...result.config.output,
        },
      };
    } else {
      // No config file found, use defaults
      config = defaultConfig;
    }

    return config;
  } catch (error) {
    console.error(
      chalk.yellow("Warning: Error loading config, using defaults")
    );
    return defaultConfig;
  }
}

/**
 * Validate config and check for required fields
 */
export function validateConfig(config: SBConfig): void {
  if (!config.openai.apiKey || config.openai.apiKey === "YOUR_API_KEY_HERE") {
    console.error(chalk.red("\n❌ Error: OpenAI API key not configured\n"));
    console.log("To fix this:");
    console.log(
      "  1. Edit " + chalk.cyan(".sb-config.json") + " in your project root"
    );
    console.log("  2. Set: " + chalk.cyan('"apiKey": "sk-your-key-here"'));
    console.log(
      "  3. Get a key at: " +
        chalk.dim("https://platform.openai.com/api-keys\n")
    );
    process.exit(1);
  }
}
