import type { SBConfig } from "../config/defaults.js";
import {
  createGitHistoryOperations,
  type CommitInfo,
} from "../git/history.js";
import { filterRelevantFiles } from "../core/file-scanner.js";

const MODEL_PRICING: Record<
  string,
  { inputPer1K: number; outputPer1K: number; tokensPerSecond: number }
> = {
  "gpt-4o-mini": {
    inputPer1K: 0.00015,
    outputPer1K: 0.0006,
    tokensPerSecond: 900,
  },
  "gpt-4o": {
    inputPer1K: 0.0025,
    outputPer1K: 0.01,
    tokensPerSecond: 450,
  },
  "gpt-4.1-mini": {
    inputPer1K: 0.0002,
    outputPer1K: 0.0008,
    tokensPerSecond: 850,
  },
  "gpt-4.1": {
    inputPer1K: 0.003,
    outputPer1K: 0.012,
    tokensPerSecond: 400,
  },
  "o4-mini": {
    inputPer1K: 0.00019,
    outputPer1K: 0.00075,
    tokensPerSecond: 900,
  },
  "o3-mini": {
    inputPer1K: 0.0004,
    outputPer1K: 0.0008,
    tokensPerSecond: 750,
  },
  "gpt-3.5-turbo": {
    inputPer1K: 0.0005,
    outputPer1K: 0.0015,
    tokensPerSecond: 1100,
  },
};

const DEFAULT_MODEL_PRICING = {
  inputPer1K: 0.0005,
  outputPer1K: 0.0015,
  tokensPerSecond: 700,
};

export interface CostEstimate {
  commits: number;
  filesToAnalyze: number;
  estimatedCost: number;
  estimatedMinutes: number;
}

export async function estimateGitflashCost(
  commits: CommitInfo[],
  config: SBConfig
): Promise<CostEstimate> {
  const repoRoot = process.cwd();
  const history = createGitHistoryOperations(repoRoot);
  const pricing = getModelPricing(config.openai.model);

  let filesToAnalyze = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalSeconds = 0;

  for (const commit of commits) {
    const changed = await history.getChangedFilesInCommit(commit.hash);
    const candidatePaths = Array.from(
      new Set(
        changed.files
          .filter((file) =>
            ["added", "modified", "renamed", "copied"].includes(file.status)
          )
          .map((file) => file.path)
          .filter((filePath) => filePath && filePath.trim().length > 0)
      )
    );

    if (candidatePaths.length === 0) {
      continue;
    }

    const relevant = await filterRelevantFiles(
      candidatePaths,
      config,
      repoRoot,
      { skipExistenceCheck: true }
    );

    for (const filePath of relevant) {
      const fileContent = await history.getFileAtCommit(commit.hash, filePath);
      if (!fileContent) {
        continue;
      }

      const inputTokens = estimateTokensFromContent(fileContent);
      const outputTokens = estimateOutputTokens(inputTokens);
      const fileSeconds = estimateProcessingSeconds(
        inputTokens,
        outputTokens,
        pricing.tokensPerSecond
      );

      totalInputTokens += inputTokens;
      totalOutputTokens += outputTokens;
      totalSeconds += fileSeconds;
      filesToAnalyze++;
    }
  }

  const inputCost = (totalInputTokens / 1000) * pricing.inputPer1K;
  const outputCost = (totalOutputTokens / 1000) * pricing.outputPer1K;
  const estimatedCost = Number((inputCost + outputCost).toFixed(4));
  const estimatedMinutes = Number((totalSeconds / 60).toFixed(1));

  return {
    commits: commits.length,
    filesToAnalyze,
    estimatedCost,
    estimatedMinutes,
  };
}

function getModelPricing(model: string | undefined) {
  if (!model) {
    return DEFAULT_MODEL_PRICING;
  }

  const normalized = model.toLowerCase();
  const match =
    MODEL_PRICING[normalized] ||
    Object.entries(MODEL_PRICING).find(([key]) => normalized.startsWith(key))?.[1];

  return match ?? DEFAULT_MODEL_PRICING;
}

function estimateTokensFromContent(content: string): number {
  return Math.max(1, Math.ceil(content.length / 4));
}

function estimateOutputTokens(inputTokens: number): number {
  const scaled = Math.round(inputTokens * 0.75);
  return Math.max(600, scaled);
}

function estimateProcessingSeconds(
  inputTokens: number,
  outputTokens: number,
  tokensPerSecond: number
): number {
  const throughput = Math.max(tokensPerSecond, 300);
  const computeTime = (inputTokens + outputTokens) / throughput;
  return Math.max(2, computeTime + 1); // add 1s overhead for git + IO
}
