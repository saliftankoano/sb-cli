import chalk from "chalk";
import boxen from "boxen";
import * as path from "path";
import readlineSync from "readline-sync";
import { createSpinner } from "nanospinner";
import { loadConfig, validateConfig } from "../config/loader.js";
import { estimateGitflashCost } from "../utils/cost-estimator.js";
import {
  gitflashEstimateBox,
  gitflashProgressLine,
} from "../utils/boxes.js";
import {
  createGitHistoryOperations,
  type CommitInfo,
} from "../git/history.js";
import { createGitOperations } from "../git/operations.js";
import {
  filterRelevantFiles,
  getLanguageFromExtension,
} from "../core/file-scanner.js";
import { OpenAIClient } from "../core/openai-client.js";
import {
  writeKnowledgeFile,
  readKnowledgeFile,
} from "../core/knowledge-writer.js";
import { brandColor } from "../utils/intro.js";

interface GitflashOptions {
  commitLimit: number;
  dryRun: boolean;
  allCommits: boolean;
  commitHash?: string;
}

interface DocumentedEntry {
  sourcePath: string;
  knowledgePath: string;
  tokens: number;
  sizeKb: number;
  insights?: string[];
  previousContent?: string;
}

export async function gitflashCommand(): Promise<void> {
  const startedAt = Date.now();
  const repoRoot = process.cwd();
  const args = process.argv.slice(3);
  const options = parseGitflashOptions(args);

  const config = await loadConfig(repoRoot);
  if (!options.dryRun) {
    validateConfig(config);
  }

  const knowledgeDirAbsolute = path.isAbsolute(config.output.knowledgeDir)
    ? config.output.knowledgeDir
    : path.join(repoRoot, config.output.knowledgeDir);
  const relativeKnowledgeDir =
    path.relative(repoRoot, knowledgeDirAbsolute) ||
    config.output.knowledgeDir;
  const knowledgeDirDisplayBase =
    relativeKnowledgeDir && relativeKnowledgeDir !== "."
      ? relativeKnowledgeDir
      : config.output.knowledgeDir;
  const knowledgeDirDisplay = ensureTrailingSlash(
    toPosixPath(knowledgeDirDisplayBase || ".startblock/knowledge")
  );
  const knowledgeDirCommandTarget =
    knowledgeDirDisplay.replace(/\/$/, "") || ".";

  const history = createGitHistoryOperations(repoRoot);
  const spinner = createSpinner("Collecting git history...").start();
  let commits: CommitInfo[] = [];

  if (options.commitHash) {
    if (options.allCommits) {
      throw new Error("Cannot use --all and --hash together.");
    }
    const commit = await history.getCommit(options.commitHash);
    if (!commit) {
      throw new Error(`Commit "${options.commitHash}" not found.`);
    }
    commits = [commit];
  } else if (options.allCommits) {
    commits = await history.getAllCommits();
  } else {
    commits = await history.getLastNCommits(options.commitLimit);
  }
  spinner.success({
    text: `Loaded ${commits.length} commit(s)`,
  });

  if (commits.length === 0) {
    console.log(chalk.yellow("No commits found. Nothing to document."));
    return;
  }

  const estimateSpinner = createSpinner("Estimating GitFlash run...").start();
  const estimate = await estimateGitflashCost(commits, config);
  estimateSpinner.success({
    text: `Estimated ${estimate.filesToAnalyze} file(s)`,
  });

  console.log(gitflashEstimateBox(estimate));

  const confirmationPrompt = options.dryRun
    ? "Proceed with GitFlash preview?"
    : "Proceed with GitFlash?";
  if (!confirmAction(confirmationPrompt, true)) {
    console.log(chalk.yellow("Aborted by user."));
    return;
  }

  console.log("");

  const openaiClient = options.dryRun ? null : new OpenAIClient(config);
  const orderedCommits = [...commits].reverse();
  const documentedEntries: DocumentedEntry[] = [];
  const plannedEntries: DocumentedEntry[] = [];
  const knowledgePathsForStage = new Set<string>();
  let skippedFiles = 0;

  for (let index = 0; index < orderedCommits.length; index++) {
    const commit = orderedCommits[index];
    const commitTitle = formatCommitTitle(commit);

    console.log(
      gitflashProgressLine(index + 1, orderedCommits.length, commitTitle)
    );

    const changed = await history.getChangedFilesInCommit(commit.hash);
    const statusByPath = new Map(changed.files.map((file) => [file.path, file]));

    const candidatePaths = Array.from(
      new Set(
        changed.files
          .filter((file) =>
            ["added", "modified", "renamed", "copied"].includes(file.status)
          )
          .map((file) => file.path)
          .filter(Boolean)
      )
    );

    if (candidatePaths.length === 0) {
      console.log(chalk.dim("       (no relevant file changes)"));
      continue;
    }

    const relevant = await filterRelevantFiles(
      candidatePaths,
      config,
      repoRoot,
      { skipExistenceCheck: true }
    );

    if (relevant.length === 0) {
      console.log(chalk.dim("       (all changed files ignored by config)"));
      continue;
    }

    for (let fileIndex = 0; fileIndex < relevant.length; fileIndex++) {
      const filePath = relevant[fileIndex];
      const branchPrefix =
        fileIndex === relevant.length - 1 ? "       └─" : "       ├─";
      const status = statusByPath.get(filePath);
      const isNew = status?.status === "added";
      const fileLabel = `${branchPrefix} ${filePath}`;

      const fileContent = await history.getFileAtCommit(
        commit.hash,
        filePath
      );
      if (!fileContent) {
        console.log(
          `${fileLabel} ${chalk.yellow("(skipped - file missing in commit)")}`
        );
        skippedFiles++;
        continue;
      }

      const metrics = getFileMetrics(fileContent);
      const detailLabel = chalk.dim(
        `[${metrics.tokens} tok · ${metrics.sizeLabel} KB]`
      );

      const existing = await readKnowledgeFile(
        filePath,
        knowledgeDirAbsolute
      );
      if (existing && existing.metadata.fileVersion === commit.hash) {
        console.log(
          `${fileLabel} ${chalk.dim("(skipped - already documented)")}`
        );
        skippedFiles++;
        continue;
      }

      const summaryEntry: DocumentedEntry = {
        sourcePath: filePath,
        knowledgePath: resolveKnowledgeRelativePath(
          repoRoot,
          knowledgeDirAbsolute,
          filePath
        ),
        tokens: metrics.tokens,
        sizeKb: metrics.sizeKb,
        previousContent: existing?.content,
      };

      if (options.dryRun) {
        console.log(`${fileLabel} ${detailLabel} ${chalk.blue("(preview)")}`);
        plannedEntries.push(summaryEntry);
        continue;
      }

      const commitContext = {
        hash: commit.hash,
        message: commit.message,
        date: safeCommitDate(commit.date),
        author: commit.author,
      };

      const context = {
        filePath,
        language: getLanguageFromExtension(filePath),
        isNew: Boolean(isNew),
        fileContent,
        dependencies: [],
        dependents: [],
        commitContext,
      };

      const fileSpinner = createSpinner(`${fileLabel} ${detailLabel}`).start();

      try {
        const analysis = await openaiClient!.analyze(context);
        const knowledgePath = await writeKnowledgeFile(filePath, analysis, {
          knowledgeDir: knowledgeDirAbsolute,
          fileVersion: commit.hash,
          model: config.openai.model,
        });

        const relativeKnowledgePath = toPosixPath(
          path.relative(repoRoot, knowledgePath)
        );

        const entry: DocumentedEntry = {
          ...summaryEntry,
          knowledgePath: relativeKnowledgePath,
          insights: analysis.insights || [],
        };

        documentedEntries.push(entry);
        plannedEntries.push(entry);
        knowledgePathsForStage.add(relativeKnowledgePath);

        fileSpinner.success({
          text: `${fileLabel} ${chalk.green("✓")} ${detailLabel}`,
          mark: "",
        });
      } catch (error: any) {
        const message = error?.message ?? "analysis error";
        fileSpinner.error({
          text: `${fileLabel} ${chalk.red(`(failed - ${message})`)} ${detailLabel}`,
        });
        skippedFiles++;
      }
    }

    if (index < orderedCommits.length - 1) {
      console.log("");
    }
  }

  const completedCount = options.dryRun
    ? plannedEntries.length
    : documentedEntries.length;
  const completionMessage = options.dryRun
    ? `\n✨ GitFlash preview complete! ${completedCount} file(s) queued.`
    : `\n✨ GitFlash complete! ${completedCount} file(s) documented.`;

  console.log(chalk.green(completionMessage));
  const totalSeconds = Math.max(0, (Date.now() - startedAt) / 1000);
  console.log(chalk.dim(`Total time: ${totalSeconds.toFixed(1)}s`));

  if (skippedFiles > 0) {
    console.log(chalk.dim(`${skippedFiles} file(s) skipped.`));
  }

  const summaryEntries = options.dryRun ? plannedEntries : documentedEntries;
  printSummaryBox(summaryEntries, {
    dryRun: options.dryRun,
    knowledgeDirDisplay,
    stageTarget: knowledgeDirCommandTarget,
  });
  printKeyFindings(summaryEntries, { dryRun: options.dryRun });

  if (!options.dryRun && knowledgePathsForStage.size > 0) {
    const wantsStage = confirmAction(
      `Stage ${knowledgeDirCommandTarget} now?`,
      false
    );
    if (wantsStage) {
      const gitOperations = createGitOperations(repoRoot);
      await gitOperations.addFiles([...knowledgePathsForStage]);
      console.log(
        chalk.green(
          `Staged ${knowledgePathsForStage.size} knowledge file(s) for commit.`
        )
      );
    }
  }
}

function parseGitflashOptions(args: string[]): GitflashOptions {
  const defaultCommits = 20;
  let commitLimit: number | undefined;
  let dryRun = false;
  let allCommits = false;
  let commitHash: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run" || arg === "--preview" || arg === "-p") {
      dryRun = true;
      continue;
    }

    if (arg === "--all" || arg === "-a") {
      allCommits = true;
      continue;
    }

    if (arg === "--hash" || arg === "-h") {
      const value = args[i + 1];
      if (!value) {
        throw new Error("--hash flag requires a commit hash");
      }
      commitHash = value;
      i++;
      continue;
    }

    if (
      arg === "--commits" ||
      arg === "--commit" ||
      arg === "--last" ||
      arg === "-c" ||
      arg === "-n"
    ) {
      const value = args[i + 1];
      if (!value) {
        throw new Error("--commits flag requires a number");
      }
      commitLimit = parseCommitValue(value);
      i++;
      continue;
    }

    if (arg.includes("=")) {
      const [flagPart, value] = arg.split("=");
      if (isCommitFlag(flagPart)) {
        if (!value) {
          throw new Error("--commits flag requires a number");
        }
        commitLimit = parseCommitValue(value);
        continue;
      }

      if (flagPart === "--all") {
        allCommits = true;
        continue;
      }

      if (flagPart === "--hash" || flagPart === "-h") {
        if (!value) {
          throw new Error("--hash flag requires a commit hash");
        }
        commitHash = value;
        continue;
      }

      throw new Error(
        `Unknown flag "${flagPart}". Supported flags: --commits/--commit/--last (-c, -n), --all (-a), --hash/-h, --dry-run/--preview (-p).`
      );
    }

    if (arg.startsWith("-") && !isRecognizedFlag(arg)) {
      throw new Error(
        `Unknown flag "${arg}". Supported flags: --commits/--commit/--last (-c, -n), --all (-a), --hash/-h, --dry-run/--preview (-p).`
      );
    }
  }

  return {
    commitLimit: commitLimit ?? defaultCommits,
    dryRun,
    allCommits,
    commitHash,
  };
}

function parseCommitValue(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("--commits must be a positive integer");
  }
  return Math.min(parsed, 200);
}

function isRecognizedFlag(flag: string): boolean {
  const flagWithoutValue = flag.split("=")[0];
  return [
    "--dry-run",
    "--preview",
    "-p",
    "--commits",
    "--commit",
    "--last",
    "-c",
    "-n",
    "--all",
    "-a",
    "--hash",
    "-h",
  ].includes(flagWithoutValue);
}

function isCommitFlag(flag: string): boolean {
  return ["--commits", "--commit", "--last"].includes(flag);
}

function confirmAction(question: string, defaultNo: boolean = true): boolean {
  const suffix = defaultNo ? "[y/N]" : "[Y/n]";
  const answer = readlineSync
    .question(chalk.cyan(`\n${question} ${suffix}: `))
    .trim()
    .toLowerCase();

  if (!answer) {
    return !defaultNo;
  }

  return answer === "y" || answer === "yes";
}

function formatCommitTitle(commit: CommitInfo): string {
  const message = commit.message?.split("\n")[0] || "No message";
  return `${commit.shortHash} "${message}"`;
}

function safeCommitDate(raw: string): Date {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

function getFileMetrics(content: string): {
  tokens: number;
  sizeKb: number;
  sizeLabel: string;
} {
  const tokens = Math.max(1, Math.ceil(content.length / 4));
  const sizeKb = content.length / 1024;
  const sizeLabel =
    sizeKb === 0 ? "0.0" : sizeKb >= 0.1 ? sizeKb.toFixed(1) : "<0.1";

  return { tokens, sizeKb, sizeLabel };
}

function resolveKnowledgeRelativePath(
  repoRoot: string,
  knowledgeDirAbsolute: string,
  sourceFile: string
): string {
  const knowledgePath = path.join(knowledgeDirAbsolute, `${sourceFile}.md`);
  const relative =
    path.relative(repoRoot, knowledgePath) || `${sourceFile}.md`;
  return toPosixPath(relative);
}

function toPosixPath(value: string): string {
  if (!value) {
    return "";
  }
  return value.split(path.sep).join("/");
}

function ensureTrailingSlash(value: string): string {
  if (!value) {
    return "./";
  }
  return value.endsWith("/") ? value : `${value}/`;
}

function printSummaryBox(
  entries: DocumentedEntry[],
  options: {
    dryRun: boolean;
    knowledgeDirDisplay: string;
    stageTarget: string;
  }
): void {
  const { dryRun, knowledgeDirDisplay, stageTarget } = options;
  const lines: string[] = [];

  lines.push(
    `${dryRun ? "Would save to" : "Knowledge saved to"}: ${
      knowledgeDirDisplay
    }`
  );
  lines.push("");

  if (entries.length > 0) {
    const grouped = groupEntriesByDirectory(entries);
    grouped.forEach(({ dir, files }) => {
      lines.push(chalk.bold(dir));
      files.forEach((file) => {
        const fileName = path.posix.basename(file.sourcePath);
        const sizeDisplay =
          file.sizeKb === 0
            ? "0.0"
            : file.sizeKb >= 0.1
            ? file.sizeKb.toFixed(1)
            : "<0.1";
        lines.push(
          `  • ${fileName} (${file.tokens} tok · ${sizeDisplay} KB)`
        );
      });
      lines.push("");
    });

    lines.push(
      dryRun
        ? "Next steps (after running without --dry-run):"
        : "Next steps:"
    );

    const reviewTarget =
      entries[0]?.knowledgePath ||
      path.posix.join(stageTarget, "<file>.md");

    lines.push(`  Review: cat ${reviewTarget}`);
    lines.push(`  Stage: git add ${stageTarget}`);
    lines.push(
      "  Commit: git commit -m 'docs: Historical documentation via GitFlash'"
    );
  } else {
    lines.push(
      dryRun
        ? "No files qualified for documentation during this preview."
        : "No new knowledge files were generated."
    );
    lines.push("");
    lines.push(
      dryRun
        ? "Re-run without --dry-run to capture knowledge."
        : "Try broadening the commit window or updating filters."
    );
  }

  console.log(
    boxen(lines.join("\n"), {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "#a855f7",
      title: dryRun ? "GitFlash Dry Run" : "GitFlash Summary",
      titleAlignment: "left",
    })
  );
}

function groupEntriesByDirectory(
  entries: DocumentedEntry[]
): Array<{ dir: string; files: DocumentedEntry[] }> {
  const groups = new Map<string, DocumentedEntry[]>();

  for (const entry of entries) {
    const dir = path.posix.dirname(entry.sourcePath) || ".";
    const label = dir === "." ? "(root)" : dir;
    const bucket = groups.get(label) ?? [];
    bucket.push(entry);
    groups.set(label, bucket);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dir, files]) => ({
      dir,
      files: files.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath)),
    }));
}

function printKeyFindings(
  entries: DocumentedEntry[],
  options: { dryRun: boolean }
): void {
  const { dryRun } = options;

  console.log("");
  console.log(chalk.bold("Key findings:"));

  if (dryRun) {
    console.log(
      chalk.dim(
        "  (Not available in preview mode. Run without --preview to capture insights.)"
      )
    );
    return;
  }

  const grouped = groupInsightsByFile(entries);

  if (grouped.length === 0) {
    console.log(chalk.dim("  No insights captured for this run."));
    return;
  }

  grouped.forEach(({ file, insights }, fileIndex) => {
    const fileLabel = brandColor(file);
    console.log(`  • ${fileLabel}`);
    insights.slice(0, 3).forEach((insight) => {
      console.log(`    - ${insight}`);
    });
    if (fileIndex !== grouped.length - 1) {
      console.log("");
    }
  });
}

function groupInsightsByFile(
  entries: DocumentedEntry[]
): Array<{ file: string; insights: string[] }> {
  const perFile = new Map<string, string[]>();

  for (const entry of entries) {
    if (!entry.insights || entry.insights.length === 0) continue;

    const fileName = path.posix.basename(entry.sourcePath);
    const previousText = (entry.previousContent || "").toLowerCase();
    const novelInsights = entry.insights
      .map((insight) => insight.trim())
      .filter(Boolean)
      .filter((insight) => {
        if (!previousText) return true;
        return !previousText.includes(insight.toLowerCase());
      });

    const finalInsights =
      novelInsights.length > 0 ? novelInsights : [entry.insights[0].trim()];

    const bucket = perFile.get(fileName) ?? [];
    for (const insight of finalInsights) {
      const key = insight.toLowerCase();
      if (!bucket.some((b) => b.toLowerCase() === key)) {
        bucket.push(insight);
      }
    }
    perFile.set(fileName, bucket);
  }

  return Array.from(perFile.entries())
    .map(([file, insights]) => ({ file, insights }))
    .filter((item) => item.insights.length > 0);
}
