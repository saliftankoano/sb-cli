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
} from "../core/file-scanner.js";
import {
  buildDependencyGraph,
  getDependencyContext,
} from "../core/dependency-graph.js";
import { OpenAIClient } from "../core/openai-client.js";
import {
  writeKnowledgeFile,
  readKnowledgeFile,
} from "../core/knowledge-writer.js";
import {
  readFeaturesManifest,
  writeFeaturesManifest,
  type Feature,
} from "../core/features.js";
import {
  generateMermaidFromUserFlows,
  generateArchitectureMermaid,
  generateMermaidJourney,
  generateMermaidSequence,
} from "../core/mermaid-generator.js";
import type { PromptContext } from "../prompts/templates.js";
import type { AnalysisResult } from "../core/openai-client.js";
import { isOnboarded, markOnboarded } from "../utils/onboarding.js";
import { fileExists } from "../utils/file-utils.js";
import {
  buildRepoSummary,
  generateDirectoryTree,
} from "../utils/repo-summary.js";
import {
  writeSession,
  type OnboardingSession,
  getGitUserName,
} from "../utils/onboarding-session.js";
import { brandColor } from "../utils/intro.js";

/**
 * Generate a copy-pasteable prompt for Cursor/IDE chat
 */
function generateChatPrompt(
  session: OnboardingSession,
  sessionPath: string
): string {
  const filesList = session.selectedFiles
    .slice(0, 5)
    .map((f) => `- ${f}`)
    .join("\n");
  const moreFiles =
    session.selectedFiles.length > 5
      ? `\n... and ${session.selectedFiles.length - 5} more files`
      : "";

  return `Help me get onboarded.

Goal: ${session.goal}
Experience Level: ${session.experienceLevel}${
    session.timebox ? `\nTime Available: ${session.timebox}` : ""
  }

Files analyzed:
${filesList}${moreFiles}

Session file: ${path.relative(process.cwd(), sessionPath)}

Please guide me through understanding these files and help me accomplish my goal.`;
}

/**
 * Handle CLI-based onboarding chat
 */
async function handleCLIOnboarding(
  session: OnboardingSession,
  repoSummary: any,
  openaiClient: OpenAIClient
): Promise<void> {
  console.log(brandColor("\n💬 CLI Onboarding Chat"));
  console.log(
    chalk.dim(
      "Ask me questions about the codebase, your goal, or the onboarding plan.\nType 'exit' or 'done' to finish.\n"
    )
  );

  const chatHistory: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }> = [
    {
      role: "system",
      content: `You are a helpful technical mentor guiding someone through onboarding. 

Their goal: ${session.goal}
Experience level: ${session.experienceLevel}
${session.timebox ? `Time available: ${session.timebox}` : ""}

Files analyzed: ${session.selectedFiles.join(", ")}

Be concise, helpful, and focus on helping them accomplish their goal.`,
    },
  ];

  while (true) {
    const question = await askQuestion("Your question (or 'exit' to finish): ");
    if (
      !question ||
      question.toLowerCase() === "exit" ||
      question.toLowerCase() === "done"
    ) {
      break;
    }

    chatHistory.push({ role: "user", content: question });

    try {
      const response = await openaiClient.chat(chatHistory);
      console.log(brandColor("\n→ " + response + "\n"));
      chatHistory.push({ role: "assistant", content: response });
    } catch (error: any) {
      console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
    }
  }
}

/**
 * Ensure .startblock/sessions/ is in .gitignore
 */
async function ensureSessionsInGitignore(repoRoot: string): Promise<void> {
  const gitignorePath = path.join(repoRoot, ".gitignore");
  const sessionsPattern = ".startblock/sessions/";

  if (await fileExists(gitignorePath)) {
    const content = await fs.readFile(gitignorePath, "utf-8");
    if (!content.includes(sessionsPattern)) {
      await fs.appendFile(
        gitignorePath,
        `\n# Startblock sessions\n${sessionsPattern}\n`
      );
    }
  } else {
    // Create .gitignore if it doesn't exist
    await fs.writeFile(
      gitignorePath,
      `# Startblock sessions\n${sessionsPattern}\n`,
      "utf-8"
    );
  }
}

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  process.stdin.setEncoding("utf8");
  process.stdin.resume();
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;

  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: isTTY,
  });
}

/**
 * Ask a yes/no question
 */
async function askYesNo(
  question: string,
  defaultNo: boolean = true
): Promise<boolean> {
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;
  const prompt = defaultNo ? `${question} [y/N]` : `${question} [Y/n]`;

  try {
    if (!isTTY) {
      const answer = readlineSync.question(brandColor(`\n${prompt}: `));
      const normalized = answer.trim().toLowerCase();
      if (!normalized) return !defaultNo;
      return normalized === "y" || normalized === "yes";
    }

    const rl = createReadlineInterface();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        rl.close();
        reject(new Error("Input timeout"));
      }, 600000); // 10 minute timeout

      rl.question(brandColor(`\n${prompt}: `), (answer) => {
        clearTimeout(timeout);
        rl.close();
        const normalized = answer.trim().toLowerCase();
        if (!normalized) resolve(!defaultNo);
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
 * Ask user a question and get text input
 */
async function askQuestion(question: string): Promise<string> {
  const isTTY = process.stdin.isTTY && process.stdout.isTTY;

  try {
    if (!isTTY) {
      const answer = readlineSync.question(brandColor(`\n${question}: `));
      return answer.trim();
    }

    const rl = createReadlineInterface();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        rl.close();
        reject(new Error("Input timeout"));
      }, 600000); // 10 minute timeout

      rl.question(brandColor(`\n${question}: `), (answer) => {
        clearTimeout(timeout);
        rl.close();
        resolve(answer.trim());
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
 * Collect onboarding session information from user
 */
async function collectOnboardingSession(): Promise<{
  goal: string;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  timebox?: string;
}> {
  console.log(
    brandColor("\n🎯 Let's personalize your onboarding experience!\n")
  );

  // Ask for goal
  const goal = await askQuestion(
    "What are you trying to accomplish? (e.g., 'Add a new feature', 'Fix a bug', 'Understand the architecture')"
  );

  if (!goal) {
    throw new Error("Goal is required for onboarding");
  }

  // Ask for experience level
  console.log(chalk.dim("\nExperience levels:"));
  console.log(chalk.dim("  1. Beginner - New to this codebase/stack"));
  console.log(chalk.dim("  2. Intermediate - Familiar with similar projects"));
  console.log(
    chalk.dim("  3. Advanced - Experienced developer, just new to this repo")
  );

  let experienceLevel: "beginner" | "intermediate" | "advanced" =
    "intermediate";
  const levelInput = await askQuestion(
    "Your experience level? [1-3, default: 2]"
  );

  if (levelInput === "1" || levelInput.toLowerCase() === "beginner") {
    experienceLevel = "beginner";
  } else if (levelInput === "3" || levelInput.toLowerCase() === "advanced") {
    experienceLevel = "advanced";
  }

  // Ask for timebox (optional)
  const timeboxInput = await askQuestion(
    "How much time do you have? (optional, e.g., '15-30m', '1-2h', or press Enter to skip)"
  );
  const timebox = timeboxInput || undefined;

  return { goal, experienceLevel, timebox };
}

/**
 * Extract project description from README
 */
function extractProjectDescription(readme: string): string {
  // Try to find description in first few paragraphs
  const lines = readme.split("\n").slice(0, 20);
  let description = "";
  for (const line of lines) {
    if (line.trim() && !line.startsWith("#") && !line.startsWith("![")) {
      description += line.trim() + " ";
      if (description.length > 200) break;
    }
  }
  return (
    description.trim() || "A software project using modern web technologies."
  );
}

/**
 * Generate onboarding documentation files
 * Uses repository summary, knowledge files, and features.json to create comprehensive docs
 * Now supports "living" docs - merges/updates instead of overwriting
 */
async function generateOnboardingDocs(
  repoRoot: string,
  knowledgeDir: string,
  repoSummary: {
    structure: {
      topLevelDirs: string[];
      topLevelFiles: string[];
      fileCounts: Record<string, number>;
    };
    documentation: {
      readme?: string;
      docs: string[];
    };
    packageJson?: {
      name?: string;
      version?: string;
      description?: string;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      engines?: Record<string, string>;
    };
    envExample?: {
      file: string;
      variables: Array<{ key: string; value?: string; comment?: string }>;
    };
    knowledgeFiles: Array<{
      path: string;
      sourceFile: string;
      importance?: string;
      tags?: string[];
    }>;
    allSourceFiles: string[];
  },
  sessionContext?: {
    goal: string;
    experienceLevel: "beginner" | "intermediate" | "advanced";
    timebox?: string;
  },
  openaiClient?: OpenAIClient,
  selectedFiles: string[] = []
): Promise<void> {
  const onboardingDir = path.join(repoRoot, ".startblock", "onboarding");
  await fs.mkdir(onboardingDir, { recursive: true });

  // Load features
  let featuresManifest = await readFeaturesManifest(repoRoot);
  let features = featuresManifest?.features || [];

  // Generate/update Mermaid diagrams for features that have userFlows but missing diagrams
  let featuresUpdated = false;
  for (const feature of features) {
    if (feature.userFlows && feature.userFlows.length > 0) {
      // Ensure filesByAction exists for all userFlows
      let needsUpdate = false;
      const filesByAction = feature.filesByAction || {};

      // Check if any userFlow is missing filesByAction
      const missingActions = feature.userFlows.filter(
        (flow) => !filesByAction[flow] || filesByAction[flow].length === 0
      );

      if (missingActions.length > 0) {
        // Populate missing actions with all feature files
        missingActions.forEach((flow) => {
          filesByAction[flow] = feature.files;
        });
        feature.filesByAction = filesByAction;
        needsUpdate = true;
      }

      // Generate diagrams if missing
      if (!feature.mermaidJourney) {
        feature.mermaidJourney = generateMermaidJourney(
          feature.name,
          feature.userFlows
        );
        needsUpdate = true;
      }

      if (!feature.mermaidSequence && Object.keys(filesByAction).length > 0) {
        feature.mermaidSequence = generateMermaidSequence(
          feature.name,
          feature.userFlows,
          filesByAction,
          feature.entryPoint
        );
        needsUpdate = true;
      }

      // Keep legacy flowchart for backward compatibility
      if (!feature.mermaidDiagram) {
        feature.mermaidDiagram = generateMermaidFromUserFlows(
          feature.name,
          feature.userFlows,
          feature.files
        );
        needsUpdate = true;
      }

      if (needsUpdate) {
        featuresUpdated = true;
      }
    }
  }

  // Save updated features.json if diagrams were generated
  if (featuresUpdated && featuresManifest) {
    featuresManifest.features = features;
    await writeFeaturesManifest(repoRoot, featuresManifest);
  }

  const readmeContent = repoSummary.documentation.readme || "";
  const knowledgeFiles = repoSummary.knowledgeFiles;
  const packageJson = repoSummary.packageJson || {};
  const projectName = packageJson.name || path.basename(repoRoot);
  const projectDescription =
    packageJson.description || extractProjectDescription(readmeContent);

  // Calculate stats
  const totalFiles = repoSummary.allSourceFiles.length;
  const fileStats = Object.entries(repoSummary.structure.fileCounts)
    .map(([ext, count]) => `${ext || "no extension"}: ${count}`)
    .join(", ");

  // Generate INDEX.md (merge with existing if present)
  const indexPath = path.join(onboardingDir, "INDEX.md");
  let existingIndex = "";
  if (await fileExists(indexPath)) {
    try {
      existingIndex = await fs.readFile(indexPath, "utf-8");
    } catch {
      // Ignore read errors
    }
  }

  // Only update if file doesn't exist or is very basic
  if (!existingIndex || existingIndex.length < 200) {
    let sessionSummary = "";
    if (sessionContext && openaiClient) {
      // Use LLM to rank features by relevance to goal
      const rankedFeatures = await openaiClient.rankFeatures(
        sessionContext.goal,
        features.map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          category: f.category,
          userFlows: f.userFlows,
          tags: f.tags,
        }))
      );

      const rankedIds = new Set(rankedFeatures.map((r) => r.id));
      const relevantFeatures = features.filter((f) => rankedIds.has(f.id));

      sessionSummary = `\n## Your Session Summary\n\n- **Goal**: ${
        sessionContext.goal
      }\n- **Experience Level**: ${sessionContext.experienceLevel}${
        sessionContext.timebox
          ? `\n- **Time Available**: ${sessionContext.timebox}`
          : ""
      }\n- **Files Analyzed**: ${selectedFiles.length} file(s)${
        selectedFiles.length > 0
          ? ` (including ${selectedFiles.slice(0, 3).join(", ")}${
              selectedFiles.length > 3
                ? `, and ${selectedFiles.length - 3} more`
                : ""
            })`
          : ""
      }\n`;

      if (relevantFeatures.length > 0) {
        sessionSummary += `\n### Recommended Features for Your Goal\n\n${rankedFeatures
          .slice(0, 3)
          .map((r) => {
            const feature = features.find((f) => f.id === r.id);
            return feature
              ? `- **${feature.name}** (${feature.category}): ${r.reason}`
              : null;
          })
          .filter(Boolean)
          .join("\n")}\n`;
      }
    }

    const indexContent = `# Welcome to ${projectName}

${projectDescription}

## Quick Stats

- **Total source files**: ${totalFiles}
- **Knowledge coverage**: ${knowledgeFiles.length} documented file(s)
- **Tech stack**: ${fileStats}

## Onboarding Path

1. **Setup** - Get your environment running (see [SETUP.md](./SETUP.md))
2. **Architecture** - Understand the codebase structure (see [ARCHITECTURE.md](./ARCHITECTURE.md))
3. **Resources** - Key docs and learning materials (see [RESOURCES.md](./RESOURCES.md))
4. **Tasks** - Hands-on exercises tailored to your goal (see [TASKS.md](./TASKS.md))

## Quick Start

\`\`\`bash
npm install
${packageJson.scripts?.dev ? `npm run dev` : ""}
\`\`\`
${sessionSummary}
`;

    await fs.writeFile(indexPath, indexContent, "utf-8");
  }

  // Generate SETUP.md (append to existing if present)
  const setupPath = path.join(onboardingDir, "SETUP.md");
  let existingSetup = "";
  if (await fileExists(setupPath)) {
    try {
      existingSetup = await fs.readFile(setupPath, "utf-8");
    } catch {
      // Ignore read errors
    }
  }

  if (!existingSetup || existingSetup.length < 200) {
    // Extract prerequisites from engines
    const nodeVersion =
      packageJson.engines?.node || `>=${process.version.split("v")[1]}`;
    const prerequisites = [`Node.js ${nodeVersion}`];
    if (packageJson.engines?.npm) {
      prerequisites.push(`npm ${packageJson.engines.npm}`);
    } else {
      prerequisites.push("npm or yarn");
    }

    // Get top dependencies
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };
    const topDeps = Object.entries(allDeps)
      .slice(0, 10)
      .map(([name, version]) => `- ${name}: ${version}`)
      .join("\n");

    // Extract installation steps from README if available
    const readmeLines = readmeContent.split("\n");
    let installSteps = "";
    let inInstallSection = false;
    for (let i = 0; i < Math.min(readmeLines.length, 100); i++) {
      const line = readmeLines[i].toLowerCase();
      if (
        line.includes("install") ||
        line.includes("setup") ||
        line.includes("getting started")
      ) {
        inInstallSection = true;
      }
      if (
        inInstallSection &&
        (line.startsWith("```") ||
          line.includes("npm install") ||
          line.includes("yarn install"))
      ) {
        installSteps +=
          readmeLines
            .slice(i, Math.min(i + 10, readmeLines.length))
            .join("\n") + "\n";
        break;
      }
    }

    // Build scripts list
    const scriptsList = packageJson.scripts
      ? Object.entries(packageJson.scripts)
          .map(([name, cmd]) => `- \`npm run ${name}\`: ${cmd}`)
          .join("\n")
      : "";

    const setupContent = `# Setup Guide

## Prerequisites

${prerequisites.map((p) => `- ${p}`).join("\n")}

## Installation

${installSteps || "```bash\nnpm install\n```"}

## Dependencies (Top 10)

${topDeps || "_No dependencies listed._"}

${scriptsList ? `## Common Scripts\n\n${scriptsList}\n` : ""}

## Environment Variables

${
  repoSummary.envExample
    ? `Copy \`${
        repoSummary.envExample.file
      }\` to \`.env.local\` and fill in the following variables:\n\n${repoSummary.envExample.variables
        .map((v) => {
          const valueHint = v.value ? ` (example: \`${v.value}\`)` : "";
          const comment = v.comment ? ` - ${v.comment}` : "";
          return `- \`${v.key}\`${valueHint}${comment}`;
        })
        .join("\n")}\n`
    : "Check `.sb-config.json` or `.env.local` for required configuration."
}

${
  packageJson.scripts?.dev
    ? `## Development\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n`
    : ""
}

## Known Issues & Solutions

_This section will be updated as issues are discovered and resolved._
`;

    await fs.writeFile(setupPath, setupContent, "utf-8");
  } else {
    // Append new issues section if it doesn't exist
    if (!existingSetup.includes("## Known Issues & Solutions")) {
      const appendContent = `\n\n## Known Issues & Solutions\n\n_This section will be updated as issues are discovered and resolved._\n`;
      await fs.appendFile(setupPath, appendContent, "utf-8");
    }
  }

  // Generate ARCHITECTURE.md (merge with existing)
  const archPath = path.join(onboardingDir, "ARCHITECTURE.md");
  let existingArch = "";
  if (await fileExists(archPath)) {
    try {
      existingArch = await fs.readFile(archPath, "utf-8");
    } catch {
      // Ignore read errors
    }
  }

  const criticalFiles = knowledgeFiles
    .filter((kf) => kf.importance === "critical" || kf.importance === "high")
    .map(
      (kf) => `- ${kf.sourceFile}${kf.importance ? ` (${kf.importance})` : ""}`
    );

  // Only update if file doesn't exist or is very basic
  if (!existingArch || existingArch.length < 200) {
    let architectureContent = `# Architecture Overview
`;

    // Add high-level architecture Mermaid diagram at the top if we have features
    if (features.length > 0) {
      const architectureDiagram = generateArchitectureMermaid(features);
      if (architectureDiagram) {
        architectureContent += `## System Overview

\`\`\`mermaid
${architectureDiagram}
\`\`\`

`;
      }
    }

    // Add Feature Map if available
    if (features.length > 0) {
      architectureContent += `\n## System Features\n\nThe codebase is organized into the following key features:\n\n`;

      // Group by category
      const featuresByCategory: Record<string, Feature[]> = {};
      features.forEach((f) => {
        if (!featuresByCategory[f.category])
          featuresByCategory[f.category] = [];
        featuresByCategory[f.category].push(f);
      });

      for (const [category, categoryFeatures] of Object.entries(
        featuresByCategory
      )) {
        architectureContent += `### ${category}\n\n`;
        for (const feature of categoryFeatures) {
          architectureContent += `- **${feature.name}**\n`;
          if (feature.description)
            architectureContent += `  - ${feature.description}\n`;
          if (feature.entryPoint)
            architectureContent += `  - Entry: \`${feature.entryPoint}\`\n`;
          if (feature.userFlows.length > 0) {
            architectureContent += `  - User Flows:\n${feature.userFlows
              .map((flow) => `    - ${flow}`)
              .join("\n")}\n`;
          }
          if (feature.mermaidDiagram) {
            architectureContent += `\n  <details><summary>View Flow Diagram</summary>\n\n  \`\`\`mermaid\n${feature.mermaidDiagram}\n  \`\`\`\n  </details>\n`;
          }
          architectureContent += "\n";
        }
      }
    }

    architectureContent += `
## Directory Tree

${generateDirectoryTree(repoSummary.allSourceFiles, 5, true)}

## Key Files

${
  criticalFiles.join("\n") ||
  "_No knowledge files yet. Run `sb analyze-commit` to generate them._"
}

## Tech Stack

Based on file extensions:
${Object.entries(repoSummary.structure.fileCounts)
  .map(([ext, count]) => `- ${ext || "no extension"}: ${count} file(s)`)
  .join("\n")}
`;

    await fs.writeFile(archPath, architectureContent, "utf-8");
  } else {
    // Update key files section if it exists, otherwise append
    if (existingArch.includes("## Key Files")) {
      // Extract everything before and after Key Files section
      const beforeKeyFiles = existingArch.split("## Key Files")[0];
      const afterKeyFiles =
        existingArch.split("## Key Files")[1]?.split("\n## ")[1] || "";
      const newKeyFilesSection = `## Key Files

${
  criticalFiles.length > 0
    ? criticalFiles.join("\n")
    : knowledgeFiles.length > 0
    ? knowledgeFiles
        .slice(0, 10)
        .map((kf) => `- ${kf.sourceFile}`)
        .join("\n")
    : "_No knowledge files yet._"
}`;
      const updatedContent =
        beforeKeyFiles +
        newKeyFilesSection +
        (afterKeyFiles ? `\n\n## ${afterKeyFiles}` : "");
      await fs.writeFile(archPath, updatedContent, "utf-8");
    }
  }

  // Generate RESOURCES.md (merge with existing)
  const resourcesPath = path.join(onboardingDir, "RESOURCES.md");
  let existingResources = "";
  if (await fileExists(resourcesPath)) {
    try {
      existingResources = await fs.readFile(resourcesPath, "utf-8");
    } catch {
      // Ignore read errors
    }
  }

  if (!existingResources || existingResources.length < 200) {
    let knowledgeSection = "";

    // Group knowledge files by Feature if available
    if (features.length > 0) {
      knowledgeSection += `_Knowledge files grouped by Feature._\n\n`;

      // Create a map of files to features
      const fileToFeatureMap = new Map<string, Feature>();
      features.forEach((f) =>
        f.files.forEach((file) => fileToFeatureMap.set(file, f))
      );

      const knowledgeByFeature: Record<string, typeof knowledgeFiles> = {};
      const unassignedKnowledge: typeof knowledgeFiles = [];

      for (const kf of knowledgeFiles) {
        const feature = fileToFeatureMap.get(kf.sourceFile);
        if (feature) {
          if (!knowledgeByFeature[feature.name])
            knowledgeByFeature[feature.name] = [];
          knowledgeByFeature[feature.name].push(kf);
        } else {
          unassignedKnowledge.push(kf);
        }
      }

      for (const [featureName, files] of Object.entries(knowledgeByFeature)) {
        knowledgeSection += `### ${featureName}\n\n`;
        knowledgeSection += files
          .map(
            (kf) =>
              `- [${path.basename(kf.sourceFile)}](${path.relative(
                onboardingDir,
                kf.path
              )})${kf.importance ? ` (**${kf.importance}**)` : ""}`
          )
          .join("\n");
        knowledgeSection += "\n\n";
      }

      if (unassignedKnowledge.length > 0) {
        knowledgeSection += `### General / Utilities\n\n`;
        knowledgeSection += unassignedKnowledge
          .map(
            (kf) =>
              `- [${path.basename(kf.sourceFile)}](${path.relative(
                onboardingDir,
                kf.path
              )})${kf.importance ? ` (**${kf.importance}**)` : ""}`
          )
          .join("\n");
        knowledgeSection += "\n\n";
      }
    } else {
      // Fallback to Tag-based grouping
      const knowledgeByTag: Record<
        string,
        Array<(typeof knowledgeFiles)[0]>
      > = {};
      const untagged: Array<(typeof knowledgeFiles)[0]> = [];

      for (const kf of knowledgeFiles) {
        if (kf.tags && kf.tags.length > 0) {
          for (const tag of kf.tags) {
            if (!knowledgeByTag[tag]) {
              knowledgeByTag[tag] = [];
            }
            knowledgeByTag[tag].push(kf);
          }
        } else {
          untagged.push(kf);
        }
      }

      if (Object.keys(knowledgeByTag).length > 0) {
        for (const [tag, files] of Object.entries(knowledgeByTag)) {
          const uniqueFiles = Array.from(
            new Set(files.map((f) => f.sourceFile))
          );
          knowledgeSection += `**${
            tag.charAt(0).toUpperCase() + tag.slice(1)
          }** [${tag} - ${uniqueFiles.length} file(s)]\n\n`;
          knowledgeSection += uniqueFiles
            .map((file) => {
              const kf = files.find((f) => f.sourceFile === file);
              return `- ${file}${kf?.importance ? ` (${kf.importance})` : ""}`;
            })
            .join("\n");
          knowledgeSection += "\n\n";
        }
      }
      if (untagged.length > 0) {
        knowledgeSection += `**Other** [${untagged.length} file(s)]\n\n`;
        knowledgeSection += untagged
          .map(
            (kf) =>
              `- ${kf.sourceFile}${kf.importance ? ` (${kf.importance})` : ""}`
          )
          .join("\n");
        knowledgeSection += "\n\n";
      }
    }

    const resourcesContent = `# Learning Resources

## Knowledge Files (Grouped by Tags)

${knowledgeSection || "_No knowledge files yet._"}

## Project Documentation

${
  repoSummary.documentation.docs.length > 0
    ? repoSummary.documentation.docs.map((doc) => `- ${doc}`).join("\n")
    : "_No additional documentation found._"
}

## External Documentation

Check your \`package.json\` dependencies and visit the official documentation for each library you're using. Most npm packages include links to their documentation in their README or on npmjs.com.
`;

    await fs.writeFile(resourcesPath, resourcesContent, "utf-8");
  } else {
    // Update knowledge files list if section exists
    if (existingResources.includes("## Knowledge Files")) {
      const beforeSection = existingResources.split("## Knowledge Files")[0];
      const afterSection =
        existingResources.split("## Knowledge Files")[1]?.split("\n## ")[1] ||
        "";
      const newKnowledgeSection = `## Knowledge Files

${
  knowledgeFiles.length > 0
    ? knowledgeFiles
        .map(
          (kf) =>
            `- ${kf.sourceFile}${kf.importance ? ` (${kf.importance})` : ""}${
              kf.tags ? ` [${kf.tags.join(", ")}]` : ""
            }`
        )
        .join("\n")
    : "_No knowledge files yet._"
}`;
      const updatedContent =
        beforeSection +
        newKnowledgeSection +
        (afterSection ? `\n\n## ${afterSection}` : "");
      await fs.writeFile(resourcesPath, updatedContent, "utf-8");
    }
  }

  // Generate TASKS.md (append to existing, never overwrite)
  const tasksPath = path.join(onboardingDir, "TASKS.md");
  let existingTasks = "";
  if (await fileExists(tasksPath)) {
    try {
      existingTasks = await fs.readFile(tasksPath, "utf-8");
    } catch {
      // Ignore read errors
    }
  }

  // Generate AI tasks if we have session context and OpenAI client
  // Note: spinner is passed from caller, but we can't use it here directly
  // The spinner update will happen in the caller before calling this function
  let aiTasks: {
    beginner: Array<{
      title: string;
      description: string;
      files: string[];
      estimatedTime: string;
    }>;
    intermediate: Array<{
      title: string;
      description: string;
      files: string[];
      estimatedTime: string;
    }>;
    advanced: Array<{
      title: string;
      description: string;
      files: string[];
      estimatedTime: string;
    }>;
  } | null = null;

  if (sessionContext && openaiClient && selectedFiles.length > 0) {
    try {
      aiTasks = await openaiClient.generateOnboardingTasks(
        repoSummary,
        selectedFiles,
        sessionContext
      );
    } catch (error: any) {
      console.warn(`Failed to generate AI tasks: ${error.message}`);
    }
  }

  if (!existingTasks || existingTasks.length < 200) {
    const goalContext = sessionContext
      ? `\nTailored to your goal: "${sessionContext.goal}" (${
          sessionContext.experienceLevel
        } level${
          sessionContext.timebox ? `, ${sessionContext.timebox} available` : ""
        })\n`
      : "";

    let tasksContent = `# Onboarding Tasks${goalContext}`;

    if (aiTasks) {
      // Use AI-generated tasks
      tasksContent += `\n## Beginner Tasks (${aiTasks.beginner.length})\n\n`;
      aiTasks.beginner.forEach((task, idx) => {
        tasksContent += `${idx + 1}. **${task.title}** (${
          task.estimatedTime
        })\n   - ${task.description}\n   - Files: ${task.files.join(", ")}\n\n`;
      });

      tasksContent += `## Intermediate Tasks (${aiTasks.intermediate.length})\n\n`;
      aiTasks.intermediate.forEach((task, idx) => {
        tasksContent += `${idx + 1}. **${task.title}** (${
          task.estimatedTime
        })\n   - ${task.description}\n   - Files: ${task.files.join(", ")}\n\n`;
      });

      tasksContent += `## Advanced Tasks (${aiTasks.advanced.length})\n\n`;
      aiTasks.advanced.forEach((task, idx) => {
        tasksContent += `${idx + 1}. **${task.title}** (${
          task.estimatedTime
        })\n   - ${task.description}\n   - Files: ${task.files.join(", ")}\n\n`;
      });
    } else {
      // Fallback to feature-based or generic tasks
      let recommendedTasks: string[] = [];
      if (sessionContext && openaiClient && features.length > 0) {
        try {
          const rankedFeatures = await openaiClient.rankFeatures(
            sessionContext.goal,
            features.map((f) => ({
              id: f.id,
              name: f.name,
              description: f.description,
              category: f.category,
              userFlows: f.userFlows,
              tags: f.tags,
            })),
            3
          );

          if (rankedFeatures.length > 0) {
            const topRanked = rankedFeatures[0];
            const topFeature = features.find((f) => f.id === topRanked.id);
            if (topFeature) {
              recommendedTasks.push(
                `1. **Explore ${topFeature.name}** - Read \`${
                  topFeature.entryPoint || topFeature.files[0]
                }\` to understand how this feature works.`
              );
              if (topFeature.userFlows.length > 0) {
                recommendedTasks.push(
                  `2. **Trace a User Flow** - Follow the code for: "${topFeature.userFlows[0]}"`
                );
              }
              recommendedTasks.push(
                `3. **Extend ${topFeature.name}** - Add a small enhancement to this feature.`
              );
            }
          }
        } catch {
          // AI ranking failed, will fall through to generic tasks
        }
      }

      tasksContent += `\n## Beginner Tasks\n\n`;
      if (recommendedTasks.length > 0) {
        tasksContent += recommendedTasks.join("\n") + "\n\n";
      } else {
        tasksContent += `1. **Read Key Files** - Read ${selectedFiles
          .slice(0, 2)
          .join(" and ")} to understand the core structure\n`;
        tasksContent += `2. **Run the Project** - Get the development environment running\n`;
        tasksContent += `3. **Make a Small Change** - Modify a non-critical file to understand the workflow\n\n`;
      }

      tasksContent += `## Intermediate Tasks\n\n`;
      tasksContent += `1. **Modify a Feature** - Make a small change to ${
        selectedFiles[0] || "a key file"
      }\n`;
      tasksContent += `2. **Add Functionality** - Implement a small feature following existing patterns\n`;
      tasksContent += `3. **Fix an Issue** - Identify and fix a bug in the codebase\n\n`;

      tasksContent += `## Advanced Tasks\n\n`;
      tasksContent += `1. **Extend Functionality** - Add new functionality related to ${
        selectedFiles[0] || "the codebase"
      }\n`;
      tasksContent += `2. **Architecture Improvements** - Propose and implement structural changes\n`;
      tasksContent += `3. **Integration Work** - Connect with external services or APIs\n\n`;
    }

    tasksContent += `## Curated Learning Paths\n\n_This section will be updated as successful learning patterns are discovered._\n`;

    await fs.writeFile(tasksPath, tasksContent, "utf-8");
  } else {
    // Only append to Curated Learning Paths section if it exists
    if (existingTasks.includes("## Curated Learning Paths")) {
      // Don't modify - let MCP or future sessions add to it
    } else {
      // Append the section if it doesn't exist
      const appendContent = `\n\n## Curated Learning Paths\n\n_This section will be updated as successful learning patterns are discovered._\n`;
      await fs.appendFile(tasksPath, appendContent, "utf-8");
    }
  }
}

/**
 * Onboard command - runs selective analysis and generates onboarding docs
 */
export async function onboardCommand(
  isPostinstall: boolean = false
): Promise<void> {
  const repoRoot = process.cwd();

  // Capture user name from git config
  const userName = await getGitUserName(repoRoot);

  // Handle postinstall mode - non-blocking invitation
  if (isPostinstall) {
    const isTTY = process.stdin.isTTY && process.stdout.isTTY;

    if (!isTTY) {
      // Non-interactive (CI, etc.) - just print message and exit
      console.log(
        brandColor(
          "\n🧠 Startblock is ready! Run 'sb onboard' when you're ready to start onboarding.\n"
        )
      );
      return;
    }

    // Interactive postinstall - ask if user wants to start now
    console.log(
      brandColor(
        "\n🧠 Startblock onboarding is available! Your npm install completed successfully.\n"
      )
    );

    try {
      const wantsOnboarding = await askYesNo(
        "Would you like to start onboarding now?",
        true // default to "no" so it doesn't block
      );

      if (!wantsOnboarding) {
        console.log(
          chalk.dim(
            "\nNo problem! Run 'sb onboard' anytime to start onboarding.\n"
          )
        );
        return;
      }

      // User said yes - continue with normal onboarding flow
      // (npm install is already complete, so this won't block it)
    } catch (error: any) {
      // Input failed or timeout - just exit gracefully
      console.log(
        chalk.dim("\nRun 'sb onboard' anytime to start onboarding.\n")
      );
      return;
    }
  }

  // Check if already onboarded (skip check for postinstall mode)
  if (!isPostinstall && (await isOnboarded(repoRoot))) {
    console.log(chalk.dim("Onboarding already completed. Skipping."));
    console.log(
      chalk.dim("Run 'sb onboard' again to start a new onboarding session.")
    );
    return;
  }

  const spinner = createSpinner("Starting onboarding...").start();

  try {
    // Load config
    spinner.update({ text: "Loading configuration..." });
    const config = await loadConfig(repoRoot);
    validateConfig(config);

    if (!config.openai.apiKey) {
      spinner.stop();
      console.log(
        chalk.yellow(
          "\n⚠️  OpenAI API key not configured. Please run 'sb init' first."
        )
      );
      return;
    }

    // Collect onboarding session info from user
    spinner.stop();
    const sessionInfo = await collectOnboardingSession();
    spinner.start();

    // Build repository summary
    spinner.update({ text: "Analyzing repository structure..." });
    const repoSummary = await buildRepoSummary(repoRoot, config);

    if (repoSummary.allSourceFiles.length === 0) {
      spinner.success({
        text: chalk.dim("No source files found for analysis."),
      });
      // Still generate basic onboarding docs
      await generateOnboardingDocs(
        repoRoot,
        config.output.knowledgeDir,
        repoSummary,
        sessionInfo,
        undefined,
        []
      );

      // Create session file
      const session: OnboardingSession = {
        goal: sessionInfo.goal,
        experienceLevel: sessionInfo.experienceLevel,
        timebox: sessionInfo.timebox,
        selectedFiles: [],
        knowledgeFiles: repoSummary.knowledgeFiles,
        docsUsed: [],
        analysisDuration: 0,
        userName,
        createdAt: new Date().toISOString(),
      };
      await writeSession(repoRoot, session);

      if (!isPostinstall) {
        await markOnboarded(repoRoot);
      }
      return;
    }

    // Use AI to select files for onboarding with session context
    spinner.update({
      text: `Selecting best files for onboarding from ${repoSummary.allSourceFiles.length} available...`,
    });
    const openaiClient = new OpenAIClient(config);
    const selectedFiles = await openaiClient.selectFilesForOnboarding(
      repoSummary,
      config.analysis.maxFilesPerAnalysis,
      sessionInfo
    );

    if (selectedFiles.length === 0) {
      spinner.success({
        text: chalk.dim("No files selected for analysis."),
      });
      await generateOnboardingDocs(
        repoRoot,
        config.output.knowledgeDir,
        repoSummary,
        sessionInfo,
        undefined,
        []
      );

      // Create session file
      const session: OnboardingSession = {
        goal: sessionInfo.goal,
        experienceLevel: sessionInfo.experienceLevel,
        timebox: sessionInfo.timebox,
        selectedFiles: [],
        knowledgeFiles: repoSummary.knowledgeFiles,
        docsUsed: [],
        analysisDuration: 0,
        userName,
        createdAt: new Date().toISOString(),
      };
      await writeSession(repoRoot, session);

      if (!isPostinstall) {
        await markOnboarded(repoRoot);
      }
      return;
    }

    // Filter to ensure files are valid and match config
    const relevantFiles = await filterRelevantFiles(
      selectedFiles,
      config,
      repoRoot
    );

    if (relevantFiles.length === 0) {
      spinner.success({
        text: chalk.dim("Selected files don't match analysis criteria."),
      });
      await generateOnboardingDocs(
        repoRoot,
        config.output.knowledgeDir,
        repoSummary,
        sessionInfo,
        undefined,
        []
      );

      // Create session file
      const session: OnboardingSession = {
        goal: sessionInfo.goal,
        experienceLevel: sessionInfo.experienceLevel,
        timebox: sessionInfo.timebox,
        selectedFiles: [],
        knowledgeFiles: repoSummary.knowledgeFiles,
        docsUsed: [],
        analysisDuration: 0,
        userName,
        createdAt: new Date().toISOString(),
      };
      await writeSession(repoRoot, session);

      if (!isPostinstall) {
        await markOnboarded(repoRoot);
      }
      return;
    }

    spinner.update({
      text: `AI selected ${relevantFiles.length} file(s) for onboarding analysis...`,
    });

    // Build dependency graph
    spinner.update({ text: "Building dependency graph..." });
    const graph = await buildDependencyGraph(relevantFiles, repoRoot);

    // Analyze files - track duration
    spinner.update({ text: "Running AI analysis on selected files..." });
    const analysisStartTime = Date.now();
    const git = createGitOperations(repoRoot);
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
      const fileVersion = (await git.getFileHash(file)) || "onboarding";
      const language = getLanguageFromExtension(file);

      // Get dependency context
      const depContext = getDependencyContext(file, graph);

      // Build context for analysis
      const context: PromptContext = {
        filePath: file,
        language,
        isNew: true, // Treat as new for onboarding
        fileContent,
        gitDiff: undefined,
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

    // Calculate analysis duration in seconds
    const analysisDuration = Math.round(
      (Date.now() - analysisStartTime) / 1000
    );

    // Write knowledge files
    spinner.update({ text: "Writing knowledge files..." });
    for (const result of analysisResults) {
      await writeKnowledgeFile(result.file, result.analysis, {
        knowledgeDir: config.output.knowledgeDir,
        fileVersion: result.fileVersion,
        model: config.openai.model,
      });
    }

    // Generate onboarding docs
    spinner.update({ text: "Generating onboarding documentation..." });
    await generateOnboardingDocs(
      repoRoot,
      config.output.knowledgeDir,
      repoSummary,
      sessionInfo,
      openaiClient,
      relevantFiles
    );

    // Ensure sessions folder is in .gitignore
    await ensureSessionsInGitignore(repoRoot);

    // Create session file with all collected information
    const session: OnboardingSession = {
      goal: sessionInfo.goal,
      experienceLevel: sessionInfo.experienceLevel,
      timebox: sessionInfo.timebox,
      selectedFiles: relevantFiles,
      knowledgeFiles: repoSummary.knowledgeFiles,
      docsUsed: [
        "INDEX.md",
        "SETUP.md",
        "ARCHITECTURE.md",
        "RESOURCES.md",
        "TASKS.md",
      ],
      suggestedTasks: [
        {
          level: sessionInfo.experienceLevel,
          description: `Work on: ${sessionInfo.goal}`,
          files: relevantFiles.slice(0, 3), // First 3 files as starting point
        },
      ],
      analysisDuration,
      userName,
      createdAt: new Date().toISOString(),
    };
    const sessionPath = await writeSession(repoRoot, session);

    // Mark as onboarded (skip for postinstall mode)
    if (!isPostinstall) {
      await markOnboarded(repoRoot);
    }

    spinner.success({
      text: chalk.green(
        `✓ Onboarding complete! Analyzed ${analysisResults.length} file(s) and generated documentation.`
      ),
    });

    console.log(brandColor("\n📚 Onboarding documentation available at:"));
    console.log(chalk.dim("  .startblock/onboarding/"));
    console.log(brandColor("\n💾 Session saved at:"));
    console.log(chalk.dim(`  ${sessionPath}`));
    if (relevantFiles.length > 0) {
      console.log(
        brandColor("\n📂 Files analyzed for this onboarding session:")
      );
      for (const file of relevantFiles) {
        console.log("  " + chalk.dim(file));
      }
    }

    // Present onboarding options
    if (!isPostinstall) {
      spinner.stop();
      console.log(
        brandColor("\n🎯 How would you like to continue onboarding?")
      );
      console.log(chalk.dim("\n  1. Onboard from CLI (interactive Q&A)"));
      console.log(
        chalk.dim("  2. Onboard from Chat (copy prompt for Cursor/IDE)")
      );

      const choice = await askQuestion(
        "\nEnter your choice [1-2, default: 2]: "
      );

      if (choice === "1") {
        await handleCLIOnboarding(session, repoSummary, openaiClient);
      } else {
        // Generate and display chat prompt
        const chatPrompt = generateChatPrompt(session, sessionPath);
        console.log(
          brandColor("\n📋 Copy this prompt and paste it into Cursor chat:\n")
        );
        console.log(chalk.dim("─".repeat(60)));
        console.log(chatPrompt);
        console.log(chalk.dim("─".repeat(60)));
        console.log(
          chalk.dim("\n💡 Startblock will use your session to guide you!")
        );
      }
    } else {
      console.log(
        chalk.dim(
          "\n💡 Continue your onboarding in Cursor chat - Startblock will use this session to guide you!"
        )
      );
    }
  } catch (error: any) {
    spinner.error({ text: chalk.red(`Error: ${error.message}`) });
    throw error;
  }
}
