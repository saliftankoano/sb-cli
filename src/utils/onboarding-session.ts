import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { ensureDir, fileExists } from "./file-utils.js";

const execAsync = promisify(exec);

/**
 * Onboarding session schema - shared contract between CLI and MCP
 */
export interface OnboardingSession {
  goal: string; // What the user wants to accomplish
  experienceLevel: "beginner" | "intermediate" | "advanced";
  timebox?: string; // Optional: "15-30m", "1-2h", etc.
  selectedFiles: string[]; // Files AI selected for onboarding
  knowledgeFiles: Array<{
    path: string;
    sourceFile: string;
    importance?: string;
    tags?: string[];
  }>; // Existing knowledge files
  docsUsed: string[]; // Onboarding docs referenced
  suggestedTasks?: Array<{
    level: "beginner" | "intermediate" | "advanced";
    description: string;
    files: string[];
  }>;
  notes?: string[]; // Notes from the onboarding session
  analysisDuration?: number; // Analysis duration in seconds
  userName?: string; // User's name from git config
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp for last update
}

/**
 * Get git user name from git config
 */
export async function getGitUserName(
  repoRoot: string
): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync("git config user.name", {
      cwd: repoRoot,
    });
    return stdout.trim() || undefined;
  } catch {
    // Git config might not be set, return undefined
    return undefined;
  }
}

/**
 * Get the sessions directory path
 */
export function getSessionsDir(repoRoot: string): string {
  return path.join(repoRoot, ".startblock", "sessions");
}

/**
 * Get the path to the current session file
 * Uses a timestamp-based filename to allow multiple sessions
 */
export function getSessionPath(repoRoot: string, sessionId?: string): string {
  const sessionsDir = getSessionsDir(repoRoot);
  const filename = sessionId
    ? `session-${sessionId}.json`
    : `session-${Date.now()}.json`;
  return path.join(sessionsDir, filename);
}

/**
 * Get the most recent session file
 */
export async function getLatestSessionPath(
  repoRoot: string
): Promise<string | null> {
  const sessionsDir = getSessionsDir(repoRoot);
  if (!(await fileExists(sessionsDir))) {
    return null;
  }

  try {
    const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
    const sessionFiles = entries
      .filter(
        (e) =>
          e.isFile() &&
          e.name.startsWith("session-") &&
          e.name.endsWith(".json")
      )
      .map((e) => path.join(sessionsDir, e.name))
      .sort()
      .reverse(); // Most recent first

    return sessionFiles.length > 0 ? sessionFiles[0] : null;
  } catch {
    return null;
  }
}

/**
 * Read an onboarding session
 */
export async function readSession(
  repoRoot: string,
  sessionPath?: string
): Promise<OnboardingSession | null> {
  const targetPath =
    sessionPath || (await getLatestSessionPath(repoRoot)) || null;

  if (!targetPath || !(await fileExists(targetPath))) {
    return null;
  }

  try {
    const content = await fs.readFile(targetPath, "utf-8");
    return JSON.parse(content) as OnboardingSession;
  } catch {
    return null;
  }
}

/**
 * Write an onboarding session
 */
export async function writeSession(
  repoRoot: string,
  session: OnboardingSession,
  sessionId?: string
): Promise<string> {
  const sessionsDir = getSessionsDir(repoRoot);
  await ensureDir(sessionsDir);

  const sessionPath = getSessionPath(repoRoot, sessionId);
  const sessionWithTimestamp = {
    ...session,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    sessionPath,
    JSON.stringify(sessionWithTimestamp, null, 2),
    "utf-8"
  );

  return sessionPath;
}

/**
 * Update an existing session
 */
export async function updateSession(
  repoRoot: string,
  updates: Partial<OnboardingSession>,
  sessionPath?: string
): Promise<string> {
  const existing = await readSession(repoRoot, sessionPath);
  if (!existing) {
    throw new Error("No existing session found to update");
  }

  const updated: OnboardingSession = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const targetPath = sessionPath || (await getLatestSessionPath(repoRoot));
  if (!targetPath) {
    throw new Error("Could not determine session path for update");
  }

  await fs.writeFile(targetPath, JSON.stringify(updated, null, 2), "utf-8");

  return targetPath;
}
