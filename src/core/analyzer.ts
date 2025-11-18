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
import {
  analysisContextBox,
  wizardPromptBox,
  readyToCommitBox,
} from "../utils/boxes.js";

/**
 * TTY (Teletypewriter) Context:
 *
 * TTY refers to a terminal/console connected to a program. When you run a command
 * in your terminal, process.stdin.isTTY is true. But when Git runs a hook, it often
 * pipes stdin, making isTTY false (non-TTY mode).
 *
 * Why this matters:
 * - TTY mode: Use native readline (works great in normal terminals)
 * - Non-TTY mode: Use readline-sync (needed for Git hooks to work reliably)
 *
 * We use readline-sync for Git hook compatibility while falling back
 * to native readline for better terminal experience when available.
 */

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
 * Ask a yes/no question and get user input
 * Works seamlessly in both TTY (normal terminal) and non-TTY (Git hooks) contexts
 * Uses readline-sync for reliable input handling in Git hooks
 */
async function askYesNo(
  question: string,
  defaultNo: boolean = true
): Promise<boolean> {
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;
  const prompt = defaultNo ? `${question} [y/N]` : `${question} [Y/n]`;

  try {
    // For non-TTY mode (Git hooks), use readline-sync
    if (!isTTY) {
      const answer = readlineSync.question(chalk.cyan(`\n${prompt}: `));
      const normalized = answer.trim().toLowerCase();
      if (!normalized) return !defaultNo; // Empty = default
      return normalized === "y" || normalized === "yes";
    }

    // For TTY mode, use standard readline
    const rl = createReadlineInterface();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        rl.close();
        reject(new Error("Input timeout"));
      }, 180000); // 3 minute timeout

      rl.question(chalk.cyan(`\n${prompt}: `), (answer) => {
        clearTimeout(timeout);
        rl.close();
        const normalized = answer.trim().toLowerCase();
        if (!normalized) resolve(!defaultNo); // Empty = default
        resolve(normalized === "y" || normalized === "yes");
      });

      rl.on("error", (err) => {
        clearTimeout(timeout);
        rl.close();
        reject(err);
      });
    });
  } catch (error: any) {
    throw new Error(`Failed to read input: ${error.message}`);
  }
}

/**
 * Ask for multi-line text input (brain dump)
 * 3 empty lines = submit
 */
async function askMultiLine(prompt: string): Promise<string> {
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;

  console.log(chalk.cyan(`\n${prompt}`));
  console.log(chalk.dim("(Press Enter 3 times to submit)"));
  process.stdout.write(chalk.cyan("\n> "));

  try {
    // For non-TTY mode (Git hooks), use readline-sync
    if (!isTTY) {
      const lines: string[] = [];
      let emptyLineCount = 0;

      while (emptyLineCount < 2) {
        const line = readlineSync.question("");
        if (line.trim() === "") {
          emptyLineCount++;
        } else {
          // Add any accumulated empty lines (preserves spacing)
          for (let i = 0; i < emptyLineCount; i++) {
            lines.push("");
          }
          emptyLineCount = 0;
          lines.push(line);
        }
      }

      const input = lines.join("\n").trim();
      return input;
    }

    // For TTY mode, use standard readline
    const rl = createReadlineInterface();
    return new Promise((resolve, reject) => {
      const lines: string[] = [];
      let emptyLineCount = 0;

      const timeout = setTimeout(() => {
        rl.close();
        reject(new Error("Input timeout"));
      }, 600000); // 10 minute timeout

      rl.on("line", (line) => {
        if (line.trim() === "") {
          emptyLineCount++;
          // Two empty lines in a row = submit
          if (emptyLineCount >= 2) {
            clearTimeout(timeout);
            rl.close();

            const input = lines.join("\n").trim();
            resolve(input);
          }
        } else {
          // Add any accumulated empty lines (preserves spacing)
          for (let i = 0; i < emptyLineCount; i++) {
            lines.push("");
          }
          emptyLineCount = 0;
          lines.push(line);
        }
      });

      rl.on("error", (err) => {
        clearTimeout(timeout);
        rl.close();
        reject(err);
      });
    });
  } catch (error: any) {
    throw new Error(`Failed to read input: ${error.message}`);
  }
}

/**
 * Enhance knowledge docs with developer insights
 *
 * CRITICAL: Developer's words are SACRED - preserve them EXACTLY as written.
 * Do NOT sanitize, clean, or filter informal language, slang, or profanity.
 * The raw, honest context is what makes this valuable.
 */
async function enhanceWithInsights(
  analysisResults: Array<{
    file: string;
    analysis: AnalysisResult;
    fileVersion: string;
  }>,
  insights: string,
  openaiClient: OpenAIClient
): Promise<{ updatedResults: typeof analysisResults; updatedFiles: string[] }> {
  // TODO: Call OpenAI to intelligently distribute insights across relevant files
  // Must preserve developer's EXACT words verbatim (no cleaning/rephrasing)

  const updatedResults = analysisResults.map((result) => {
    const enhancedMarkdown = `${result.analysis.markdown}

## Developer Insights

${insights}`;

    return {
      ...result,
      analysis: {
        ...result.analysis,
        markdown: enhancedMarkdown,
      },
    };
  });

  // Return which files were updated
  const updatedFiles = analysisResults.map((r) => r.file);
  return { updatedResults, updatedFiles };
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

    spinner.update({ text: "Building dependency graph..." });
    const graph = await buildDependencyGraph(relevantFiles, repoRoot);

    spinner.update({ text: "Running AI analysis on all files..." });
    const openaiClient = new OpenAIClient(config);
    let analysisResults: Array<{
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

      // Analyze with OpenAI
      const analysis = await openaiClient.analyze(context);
      analysisResults.push({
        file,
        analysis,
        fileVersion,
      });
    }

    if (analysisResults.length === 0) {
      spinner.success({
        text: chalk.dim("All files up to date (no changes needed)"),
      });
      return;
    }

    spinner.success({
      text: chalk.green("✓ AI analysis complete for all files"),
    });

    // Show commit context with accurate counts
    console.log(analysisContextBox(stagedFiles.length, analysisResults.length));

    // Interactive insight gathering loop
    let continueLoop = true;
    while (continueLoop) {
      // Step 5: Opt-in to add insights
      let wantsToAddInsights = false;
      try {
        wantsToAddInsights = await askYesNo("Want to add your insights?", true);
      } catch (error: any) {
        console.log(
          chalk.yellow(
            `\n⚠️  Input unavailable (${error.message}). Proceeding with AI analysis only.\n`
          )
        );
        continueLoop = false;
        break;
      }

      if (!wantsToAddInsights) {
        // User skipped, proceed to commit
        continueLoop = false;
        break;
      }

      // Step 6: Get developer insights (one open-ended brain dump)
      console.log(wizardPromptBox());

      let insights = "";
      try {
        insights = await askMultiLine("");
      } catch (error: any) {
        console.log(
          chalk.yellow(
            `\n⚠️  Input failed (${error.message}). Skipping insights.\n`
          )
        );
        continueLoop = false;
        break;
      }

      if (!insights) {
        console.log(
          chalk.dim("\nNo insights provided, skipping enhancement.\n")
        );
        continueLoop = false;
        break;
      }

      // Step 7: Enhance docs with insights
      const enhanceSpinner = createSpinner(
        "Enhancing knowledge docs with your insights..."
      ).start();

      const { updatedResults, updatedFiles } = await enhanceWithInsights(
        analysisResults,
        insights,
        openaiClient
      );

      analysisResults = updatedResults;

      enhanceSpinner.success({
        text: chalk.green("Enhanced knowledge docs with your insights"),
      });

      // Show what was updated
      console.log(chalk.cyan("\nUpdated files where this is most relevant:"));
      for (const file of updatedFiles) {
        console.log(chalk.yellow(`  • ${file}`));
      }

      // Step 8: Confirmation to commit
      console.log(readyToCommitBox(analysisResults.length));

      let readyToCommit = false;
      try {
        readyToCommit = await askYesNo("Ready to commit?", true);
      } catch (error: any) {
        console.log(
          chalk.yellow(
            `\n⚠️  Input unavailable (${error.message}). Proceeding with commit.\n`
          )
        );
        continueLoop = false;
        break;
      }

      if (readyToCommit) {
        // User confirmed, exit loop
        continueLoop = false;
      } else {
        // User said no, ask if they want to add more
        let wantsMoreInsights = false;
        try {
          wantsMoreInsights = await askYesNo(
            "Want to add more insights?",
            true
          );
        } catch (error: any) {
          console.log(chalk.yellow("\n⚠️  Commit aborted by user."));
          process.exit(1);
        }

        if (!wantsMoreInsights) {
          // User doesn't want to add more, abort commit
          console.log(chalk.yellow("\n⚠️  Commit aborted by user."));
          process.exit(1);
        }

        // Loop continues for more insights
      }
    }

    // Step 9: Write knowledge files and stage them
    const writeSpinner = createSpinner("Writing knowledge files...").start();

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

    // Step 10: Stage knowledge files
    await git.addFiles(knowledgeFiles);

    writeSpinner.success({
      text: chalk.green(
        `✓ ${knowledgeFiles.length} knowledge file(s) ready to commit!`
      ),
    });

    // Final celebratory message
    console.log(
      chalk.cyan.bold(
        "\n🚀 Your future teammates will thank you! Committing now...\n"
      )
    );
  } catch (error: any) {
    spinner.error({ text: chalk.red(`Error: ${error.message}`) });
    throw error;
  }
}
