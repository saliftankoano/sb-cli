import { cosmiconfig } from 'cosmiconfig';
import { defaultConfig, type SBConfig } from './defaults.js';
import chalk from 'chalk';

/**
 * Load configuration from various sources
 * Searches for: .sb-config.json, .sb-config.js, package.json (sb field)
 */
export async function loadConfig(): Promise<SBConfig> {
  const explorer = cosmiconfig('sb');
  
  try {
    const result = await explorer.search();
    
    if (result) {
      // Merge with defaults
      const config = {
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
      
      return config;
    }
    
    // No config file found, use defaults
    return defaultConfig;
  } catch (error) {
    console.error(chalk.yellow('Warning: Error loading config, using defaults'));
    return defaultConfig;
  }
}

/**
 * Validate config and check for required fields
 */
export function validateConfig(config: SBConfig): void {
  if (!config.openai.apiKey || config.openai.apiKey === '${OPENAI_API_KEY}') {
    console.error(chalk.red('\n❌ Error: OPENAI_API_KEY not set\n'));
    console.log('Set it in one of these ways:');
    console.log('  1. Environment variable: ' + chalk.cyan('export OPENAI_API_KEY=sk-...'));
    console.log('  2. Config file: Update ' + chalk.cyan('.sb-config.json'));
    process.exit(1);
  }
}

