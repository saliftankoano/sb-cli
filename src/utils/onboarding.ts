import * as fs from "fs/promises";
import * as path from "path";
import { fileExists, ensureDir } from "./file-utils.js";

/**
 * Get the path to the onboarding marker file
 */
export function getOnboardingMarkerPath(repoRoot: string): string {
  return path.join(repoRoot, ".startblock", ".onboarded");
}

/**
 * Check if onboarding has already been completed
 */
export async function isOnboarded(repoRoot: string): Promise<boolean> {
  const markerPath = getOnboardingMarkerPath(repoRoot);
  return await fileExists(markerPath);
}

/**
 * Mark onboarding as complete by creating the marker file
 */
export async function markOnboarded(repoRoot: string): Promise<void> {
  const markerPath = getOnboardingMarkerPath(repoRoot);
  await ensureDir(path.dirname(markerPath));
  await fs.writeFile(
    markerPath,
    `# Startblock Onboarding Complete
# This file indicates that onboarding has been completed for this repository.
# Created: ${new Date().toISOString()}
`,
    "utf-8"
  );
}
