import * as fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";
import { readSession } from "../../utils/onboarding-session.js";
import { loadConfig } from "../../config/loader.js";
import { fileExists } from "../../utils/file-utils.js";

export interface FileContext {
  path: string;
  content: string;
  knowledge?: string;
  totalLines: number;
}

export interface OnboardingContext {
  type: "onboarding-context";
  session: any;
  features: any[];
  knowledgeFiles: Record<string, string>; // path -> markdown content
  currentFile?: FileContext;
}

/**
 * Build the full initial context for the voice agent
 */
export async function buildOnboardingContext(
  repoRoot: string
): Promise<OnboardingContext | null> {
  try {
    // 1. Load session
    const session = await readSession(repoRoot);
    if (!session) return null;

    // 2. Load features
    const config = await loadConfig(repoRoot);
    const featuresPath = path.join(repoRoot, ".startblock", "features.json");
    let features: any[] = [];
    if (await fileExists(featuresPath)) {
      const data = JSON.parse(await fs.readFile(featuresPath, "utf-8"));
      features = data.features || [];
    }

    // 3. Load knowledge for selected files
    const knowledgeDir = path.join(repoRoot, config.output.knowledgeDir);
    const knowledgeFiles: Record<string, string> = {};

    for (const filePath of session.selectedFiles) {
      const kPath = path.join(knowledgeDir, `${filePath}.md`);
      if (await fileExists(kPath)) {
        const content = await fs.readFile(kPath, "utf-8");
        const { content: markdown } = matter(content);
        knowledgeFiles[filePath] = markdown;
      }
    }

    // 4. Get first file content
    let currentFile: FileContext | undefined;
    if (session.selectedFiles.length > 0) {
      const firstFile = session.selectedFiles[0];
      const fullPath = path.join(repoRoot, firstFile);
      if (await fileExists(fullPath)) {
        const content = await fs.readFile(fullPath, "utf-8");
        currentFile = {
          path: firstFile,
          content,
          knowledge: knowledgeFiles[firstFile],
          totalLines: content.split("\n").length,
        };
      }
    }

    return {
      type: "onboarding-context",
      session,
      features,
      knowledgeFiles,
      currentFile,
    };
  } catch (error) {
    console.error("Error building onboarding context:", error);
    return null;
  }
}

/**
 * Get source content and knowledge for a specific file
 */
export async function getFileWithKnowledge(
  repoRoot: string,
  filePath: string
): Promise<FileContext | null> {
  try {
    const fullPath = path.join(repoRoot, filePath);
    if (!(await fileExists(fullPath))) return null;

    const content = await fs.readFile(fullPath, "utf-8");
    const config = await loadConfig(repoRoot);
    const kPath = path.join(repoRoot, config.output.knowledgeDir, `${filePath}.md`);
    
    let knowledge: string | undefined;
    if (await fileExists(kPath)) {
      const kContent = await fs.readFile(kPath, "utf-8");
      const { content: markdown } = matter(kContent);
      knowledge = markdown;
    }

    return {
      path: filePath,
      content,
      knowledge,
      totalLines: content.split("\n").length,
    };
  } catch (error) {
    console.error(`Error getting file context for ${filePath}:`, error);
    return null;
  }
}
