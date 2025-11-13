import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import * as fs from 'fs/promises';
import * as path from 'path';
import { loadConfig, validateConfig } from '../config/loader.js';
import { createGitOperations } from '../git/operations.js';
import { filterRelevantFiles, getLanguageFromExtension } from './file-scanner.js';
import { buildDependencyGraph, getDependencyContext } from './dependency-graph.js';
import { OpenAIClient } from './openai-client.js';
import { writeKnowledgeFile, readKnowledgeFile } from './knowledge-writer.js';
import type { PromptContext } from '../prompts/templates.js';

/**
 * Main analyzer - orchestrates the entire analysis workflow
 */
export async function analyzeCommit(): Promise<void> {
  const repoRoot = process.cwd();
  
  // Load and validate configuration
  const config = await loadConfig();
  validateConfig(config);

  const git = createGitOperations(repoRoot);
  const spinner = createSpinner('Analyzing staged files...').start();

  try {
    // Step 1: Get staged files
    const stagedFiles = await git.getStagedFiles();
    
    if (stagedFiles.length === 0) {
      spinner.success({ text: chalk.dim('No staged files to analyze.') });
      return;
    }

    // Step 2: Filter relevant files
    const relevantFiles = await filterRelevantFiles(stagedFiles, config, repoRoot);
    
    if (relevantFiles.length === 0) {
      spinner.success({ text: chalk.dim('No analyzable source files staged.') });
      return;
    }

    spinner.update({ text: `Found ${relevantFiles.length} file(s) to analyze...` });

    // Step 3: Build dependency graph (optional, can be simplified)
    spinner.update({ text: 'Building dependency graph...' });
    const graph = await buildDependencyGraph(relevantFiles, repoRoot);

    // Step 4: Analyze each file with OpenAI
    const openaiClient = new OpenAIClient(config);
    const knowledgeFiles: string[] = [];

    for (let i = 0; i < relevantFiles.length; i++) {
      const file = relevantFiles[i];
      spinner.update({ 
        text: `Analyzing ${file} (${i + 1}/${relevantFiles.length})...` 
      });

      const filePath = path.join(repoRoot, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const fileVersion = await git.getFileHash(file) || 'unknown';
      const gitDiff = await git.getFileDiff(file);
      const language = getLanguageFromExtension(file);

      // Check if file is new or modified
      const existing = await readKnowledgeFile(file, config.output.knowledgeDir);
      const isNew = !existing;

      // Skip if file hasn't changed (same version)
      if (existing && existing.metadata.fileVersion === fileVersion) {
        continue;
      }

      // Get dependency context
      const depContext = getDependencyContext(file, graph);

      // Build context for analysis
      const context: PromptContext = {
        filePath: file,
        language,
        isNew,
        fileContent,
        gitDiff: gitDiff || undefined,
        dependencies: depContext.dependencies,
        dependents: depContext.dependents,
      };

      // Analyze with OpenAI
      const analysis = await openaiClient.analyze(context);

      // Write knowledge file
      const knowledgePath = await writeKnowledgeFile(file, analysis, {
        knowledgeDir: config.output.knowledgeDir,
        fileVersion,
        model: config.openai.model,
      });

      knowledgeFiles.push(knowledgePath);
    }

    // Step 5: Stage knowledge files
    if (knowledgeFiles.length > 0) {
      await git.addFiles(knowledgeFiles);
      
      spinner.success({ 
        text: chalk.green(`✓ Analyzed ${knowledgeFiles.length} file(s)`) 
      });
      
      console.log(chalk.cyan(`\n📚 Updated ${knowledgeFiles.length} knowledge file(s)`));
      console.log(chalk.dim('(Knowledge files auto-staged for commit)\n'));
    } else {
      spinner.success({ 
        text: chalk.dim('All files up to date (no changes needed)') 
      });
    }

  } catch (error: any) {
    spinner.error({ text: chalk.red(`Error: ${error.message}`) });
    throw error;
  }
}

