import * as fs from "fs/promises";
import * as path from "path";
import { fileExists } from "./file-utils.js";

export interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Find package.json starting from current directory and walking up
 */
export async function findPackageJson(
  startDir: string
): Promise<string | null> {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (await fileExists(packageJsonPath)) {
      return packageJsonPath;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Read and parse package.json
 */
export async function readPackageJson(
  packageJsonPath: string
): Promise<PackageJson> {
  const content = await fs.readFile(packageJsonPath, "utf-8");
  return JSON.parse(content);
}

/**
 * Write package.json with proper formatting
 */
export async function writePackageJson(
  packageJsonPath: string,
  data: PackageJson
): Promise<void> {
  const content = JSON.stringify(data, null, 2) + "\n";
  await fs.writeFile(packageJsonPath, content, "utf-8");
}

/**
 * Update or create postinstall script in package.json
 * If postinstall exists, appends " && sb onboard || true"
 * If it doesn't exist, creates it as "sb onboard || true"
 */
export async function updatePostinstallScript(
  packageJsonPath: string
): Promise<boolean> {
  const packageJson = await readPackageJson(packageJsonPath);

  // Ensure scripts object exists
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  const existingPostinstall = packageJson.scripts.postinstall;

  // Check if sb onboard is already in the script
  if (existingPostinstall?.includes("sb onboard")) {
    return false; // Already configured
  }

  // Add or append the command
  if (existingPostinstall) {
    packageJson.scripts.postinstall = `${existingPostinstall} && sb onboard || true`;
  } else {
    packageJson.scripts.postinstall = "sb onboard || true";
  }

  await writePackageJson(packageJsonPath, packageJson);
  return true; // Was updated
}
