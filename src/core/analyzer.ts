import chalk from "chalk";
import { createSpinner } from "nanospinner";
import * as fs from "fs/promises";
import * as path from "path";
import * as readline from "readline";
import * as readlineSync from "readline-sync";
import { loadConfig, validateConfig } from "../config/loader.js";
import { createGitOperations } from "../git/operations.js";
import {
  filterRelevantFiles,
  getLanguageFromExtension,
} from "./file-scanner.js";
import {
  buildDependencyGraph,
  getDependencyContext,
} from "./dependency-graph.js";
import { OpenAIClient } from "./openai-client.js";
import { writeKnowledgeFile, readKnowledgeFile } from "./knowledge-writer.js";
import type { PromptContext } from "../prompts/templates.js";
import type { AnalysisResult } from "./openai-client.js";

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  // Make sure stdin is readable and set encoding
  process.stdin.setEncoding("utf8");
  process.stdin.resume();

  // Check if we can use terminal mode (only if it's a TTY)
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;

  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: isTTY, // Only use terminal mode if both are TTYs
  });
}

/**
 * Ask a question and get user input
 * Works seamlessly in both TTY (normal terminal) and non-TTY (Git hooks) contexts
 * Uses readline-sync for non-TTY mode to ensure reliable input handling
 */
async function askQuestion(question: string): Promise<string> {
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;

  // For non-TTY mode (Git hooks), use readline-sync for reliable input handling
  if (!isTTY) {
    try {
      const answer = readlineSync.question(chalk.cyan(`\n${question}\n> `));
      return answer.trim();
    } catch (error: any) {
      throw new Error(`Failed to read input: ${error.message}`);
    }
  }

  // For TTY mode, use standard readline
  const rl = createReadlineInterface();

  return new Promise((resolve, reject) => {
    // Set a longer timeout for user input
    const timeout = setTimeout(() => {
      rl.close();
      reject(
        new Error(
          "Input timeout - no response received. Skipping interactive Q&A."
        )
      );
    }, 180000); // 3 minute timeout

    rl.question(chalk.cyan(`\n${question}\n> `), (answer) => {
      clearTimeout(timeout);
      rl.close();
      resolve(answer.trim());
    });

    // Handle stdin errors gracefully
    rl.on("error", (err) => {
      clearTimeout(timeout);
      rl.close();
      reject(new Error(`Failed to read input: ${err.message}`));
    });
  });
}

/**
 * Generate clarifying questions for a file
 */
function generateQuestionsForFile(filePath: string, isNew: boolean): string[] {
  const questions = [
    `What is the main purpose of ${chalk.yellow(filePath)}?`,
    `What gotchas or non-obvious behaviors should developers know about?`,
    `How does this file fit into the larger system? What are the critical dependencies?`,
  ];

  if (isNew) {
    questions.push(`Why did you create this file? What problem does it solve?`);
  } else {
    questions.push(
      `What changed in this commit? Why did you make these changes?`
    );
  }

  return questions;
}

/**
 * Refine analysis based on user answers
 */
async function refineAnalysisWithAnswers(
  initialAnalysis: AnalysisResult,
  userAnswers: Record<string, string>,
  openaiClient: OpenAIClient
): Promise<AnalysisResult> {
  // Build a refinement prompt
  const refinementPrompt = `You previously generated this knowledge documentation:

${initialAnalysis.markdown}

Now the developer has provided additional context:

${Object.entries(userAnswers)
  .map(([q, a]) => `Q: ${q}\nA: ${a}`)
  .join("\n\n")}

Enhance the documentation by incorporating their insights. Keep the same structure but add their tacit knowledge. Be specific and use their own words where appropriate.`;

  // For now, just append the user answers in a "Developer Notes" section
  // In a full implementation, you'd call OpenAI again to integrate the answers
  const enhancedMarkdown = `${initialAnalysis.markdown}

## Developer Notes

${Object.entries(userAnswers)
  .map(([q, a]) => `**${q}**\n\n${a}`)
  .join("\n\n")}`;

  return {
    ...initialAnalysis,
    markdown: enhancedMarkdown,
  };
}

/**
 * Main analyzer - orchestrates the entire analysis workflow
 */
export async function analyzeCommit(): Promise<void> {
  const repoRoot = process.cwd();

  // Load and validate configuration (explicitly search from repo root)
  const config = await loadConfig(repoRoot);
  validateConfig(config);

  const git = createGitOperations(repoRoot);
  const spinner = createSpinner("Analyzing staged files...").start();

  try {
    // Step 1: Get staged files
    const stagedFiles = await git.getStagedFiles();

    if (stagedFiles.length === 0) {
      spinner.success({ text: chalk.dim("No staged files to analyze.") });
      return;
    }

    // Step 2: Filter relevant files
    const relevantFiles = await filterRelevantFiles(
      stagedFiles,
      config,
      repoRoot
    );

    if (relevantFiles.length === 0) {
      spinner.success({
        text: chalk.dim("No analyzable source files staged."),
      });
      return;
    }

    spinner.update({
      text: `Found ${relevantFiles.length} file(s) to analyze...`,
    });

    // Step 3: Build dependency graph (optional, can be simplified)
    spinner.update({ text: "Building dependency graph..." });
    const graph = await buildDependencyGraph(relevantFiles, repoRoot);

    // Step 4: Analyze each file with OpenAI and gather developer knowledge
    const openaiClient = new OpenAIClient(config);
    const analysisResults: Array<{
      file: string;
      analysis: AnalysisResult;
      fileVersion: string;
    }> = [];

    for (let i = 0; i < relevantFiles.length; i++) {
      const file = relevantFiles[i];
      spinner.update({
        text: `Analyzing ${file} (${i + 1}/${relevantFiles.length})...`,
      });

      const filePath = path.join(repoRoot, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const fileVersion = (await git.getFileHash(file)) || "unknown";
      const gitDiff = await git.getFileDiff(file);
      const language = getLanguageFromExtension(file);

      // Check if file is new or modified
      const existing = await readKnowledgeFile(
        file,
        config.output.knowledgeDir
      );
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

      // Analyze with OpenAI (initial analysis)
      const initialAnalysis = await openaiClient.analyze(context);

      spinner.stop();

      // Interactive Q&A session - works in both TTY and non-TTY (Git hooks)
      // Uses readline-sync for non-TTY mode to ensure reliable input handling
      let refinedAnalysis: AnalysisResult;
      const userAnswers: Record<string, string> = {};

      // Always attempt interactive Q&A - works seamlessly in Git hooks
      try {
        console.log(
          chalk.green.bold(
            `\n✓ Initial analysis complete for ${chalk.yellow(file)}`
          )
        );
        console.log(
          chalk.dim(
            "Now let's capture your unique insights about this file...\n"
          )
        );

        const questions = generateQuestionsForFile(file, isNew);

        // Ask questions one at a time
        for (const question of questions) {
          try {
            const answer = await askQuestion(question);
            if (answer) {
              userAnswers[question] = answer;
            }
          } catch (error: any) {
            // If input fails (shouldn't happen with readline-sync, but handle gracefully)
            console.log(
              chalk.yellow(
                `\n⚠️  Skipping remaining questions (${error.message}). Analysis will continue with AI insights only.\n`
              )
            );
            break;
          }
        }

        // Refine analysis with user input
        refinedAnalysis = await refineAnalysisWithAnswers(
          initialAnalysis,
          userAnswers,
          openaiClient
        );
      } catch (error: any) {
        // If interactive Q&A fails (shouldn't happen with readline-sync, but handle gracefully)
        console.log(
          chalk.yellow(
            `\n⚠️  Interactive Q&A unavailable (${error.message}). Using AI analysis only.\n`
          )
        );
        refinedAnalysis = initialAnalysis;
      }

      analysisResults.push({
        file,
        analysis: refinedAnalysis,
        fileVersion,
      });

      // Restart spinner for next file
      if (i < relevantFiles.length - 1) {
        spinner.start();
      }
    }

    if (analysisResults.length === 0) {
      spinner.success({
        text: chalk.dim("All files up to date (no changes needed)"),
      });
      return;
    }

    // Show recap of what was documented
    console.log(chalk.cyan.bold("\n📚 Knowledge Documentation Summary:\n"));
    for (const result of analysisResults) {
      console.log(chalk.yellow(`  • ${result.file}`));
    }

    // Get final confirmation - try interactive, fall back if needed
    try {
      const confirm = await askQuestion(
        chalk.green.bold(
          "\n✅ Ready to finalize and commit this knowledge? (yes/no)"
        )
      );

      if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
        console.log(chalk.yellow("\n⚠️  Commit aborted by user."));
        process.exit(1);
      }
    } catch (error: any) {
      // If stdin becomes unavailable, proceed anyway (but warn user)
      console.log(
        chalk.yellow(
          `\n⚠️  Skipping confirmation (${error.message}). Proceeding with knowledge generation.\n`
        )
      );
    }

    // Step 5: Write knowledge files and stage them
    spinner.start();
    spinner.update({ text: "Writing knowledge files..." });

    const knowledgeFiles: string[] = [];
    for (const result of analysisResults) {
      const knowledgePath = await writeKnowledgeFile(
        result.file,
        result.analysis,
        {
          knowledgeDir: config.output.knowledgeDir,
          fileVersion: result.fileVersion,
          model: config.openai.model,
        }
      );
      knowledgeFiles.push(knowledgePath);
    }

    // Step 6: Stage knowledge files
    await git.addFiles(knowledgeFiles);

    spinner.success({
      text: chalk.green(
        `✓ ${knowledgeFiles.length} knowledge file(s) ready to commit!`
      ),
    });

    console.log(
      chalk.cyan(
        `\n📚 ${knowledgeFiles.length} knowledge file(s) staged for commit`
      )
    );
    console.log(chalk.green.bold("You can now complete your commit! 🚀\n"));
  } catch (error: any) {
    spinner.error({ text: chalk.red(`Error: ${error.message}`) });
    throw error;
  }
}
