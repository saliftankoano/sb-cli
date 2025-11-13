import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ensureDir, fileExists } from '../utils/file-utils.js';

const execAsync = promisify(exec);

const DEFAULT_CONFIG = `{
  "openai": {
    "apiKey": "\${OPENAI_API_KEY}",
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

const HUSKY_PRE_COMMIT = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run sb analyze on staged files
sb analyze-commit
`;

/**
 * Initialize Startblock in current repository
 */
export async function initCommand(): Promise<void> {
  const repoRoot = process.cwd();

  console.log(chalk.cyan('\n🚀 Initializing Startblock CLI...\n'));

  try {
    // 1. Create .startblock directory
    const startblockDir = path.join(repoRoot, '.startblock');
    const knowledgeDir = path.join(startblockDir, 'knowledge');
    
    await ensureDir(knowledgeDir);
    console.log(chalk.green('✓ Created .startblock/knowledge directory'));

    // 2. Create .sb-config.json if it doesn't exist
    const configPath = path.join(repoRoot, '.sb-config.json');
    if (!(await fileExists(configPath))) {
      await fs.writeFile(configPath, DEFAULT_CONFIG, 'utf-8');
      console.log(chalk.green('✓ Created .sb-config.json'));
    } else {
      console.log(chalk.yellow('⚠ .sb-config.json already exists (skipped)'));
    }

    // 3. Check if Husky is installed
    const packageJsonPath = path.join(repoRoot, 'package.json');
    const hasPackageJson = await fileExists(packageJsonPath);

    if (!hasPackageJson) {
      console.log(chalk.yellow('\n⚠ No package.json found. Skipping Husky setup.'));
      console.log(chalk.dim('Run this command in a Node.js project to enable automatic analysis.'));
    } else {
      // Install Husky
      console.log(chalk.cyan('\n📦 Setting up Husky hooks...'));
      
      try {
        await execAsync('npm install --save-dev husky', { cwd: repoRoot });
        console.log(chalk.green('✓ Installed Husky'));

        await execAsync('npx husky init', { cwd: repoRoot });
        console.log(chalk.green('✓ Initialized Husky'));

        // Create pre-commit hook
        const huskyDir = path.join(repoRoot, '.husky');
        const preCommitPath = path.join(huskyDir, 'pre-commit');
        
        await fs.writeFile(preCommitPath, HUSKY_PRE_COMMIT, 'utf-8');
        await fs.chmod(preCommitPath, 0o755); // Make executable
        
        console.log(chalk.green('✓ Created pre-commit hook'));
      } catch (error: any) {
        console.log(chalk.yellow('⚠ Husky setup failed:'), error.message);
        console.log(chalk.dim('You can set it up manually later.'));
      }
    }

    // 4. Update .gitignore
    const gitignorePath = path.join(repoRoot, '.gitignore');
    if (await fileExists(gitignorePath)) {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      if (!gitignoreContent.includes('.startblock/.sb-cache')) {
        await fs.appendFile(gitignorePath, '\n# Startblock cache\n.startblock/.sb-cache/\n');
        console.log(chalk.green('✓ Updated .gitignore'));
      }
    }

    // Success message
    console.log(chalk.green.bold('\n✨ Initialization complete!\n'));
    console.log('Next steps:');
    console.log('  1. Set your OpenAI API key:');
    console.log(chalk.cyan('     export OPENAI_API_KEY=sk-...'));
    console.log('  2. Commit some code:');
    console.log(chalk.cyan('     git add . && git commit -m "feat: new feature"'));
    console.log('  3. Watch as knowledge is automatically captured! 🎉\n');

  } catch (error: any) {
    console.error(chalk.red(`\n❌ Initialization failed: ${error.message}\n`));
    process.exit(1);
  }
}

