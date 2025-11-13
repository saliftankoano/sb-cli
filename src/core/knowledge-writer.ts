import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';
import { ensureDir, fileExists } from '../utils/file-utils.js';
import type { AnalysisResult } from './openai-client.js';

export interface KnowledgeMetadata {
  filePath: string;
  fileVersion: string;
  lastUpdated: string;
  updatedBy: string;
  tags: string[];
  importance: string;
  extractedBy: string;
  model: string;
  humanVerified: boolean;
}

/**
 * Generate knowledge file path from source file path
 */
export function getKnowledgeFilePath(sourceFile: string, knowledgeDir: string): string {
  // Replace / with _ to create flat structure
  const fileName = sourceFile.replace(/\//g, '_') + '.md';
  return path.join(knowledgeDir, fileName);
}

/**
 * Write knowledge documentation to file
 */
export async function writeKnowledgeFile(
  sourceFilePath: string,
  analysis: AnalysisResult,
  options: {
    knowledgeDir: string;
    fileVersion: string;
    model: string;
  }
): Promise<string> {
  const { knowledgeDir, fileVersion, model } = options;
  
  // Ensure knowledge directory exists
  await ensureDir(knowledgeDir);

  const knowledgePath = getKnowledgeFilePath(sourceFilePath, knowledgeDir);
  
  // Check if file exists for incremental updates
  const exists = await fileExists(knowledgePath);
  let existingData: { data?: Partial<KnowledgeMetadata> } = {};
  
  if (exists) {
    try {
      const existingContent = await fs.readFile(knowledgePath, 'utf-8');
      existingData = matter(existingContent);
    } catch {
      // Ignore errors reading existing file
    }
  }

  const metadata: KnowledgeMetadata = {
    filePath: sourceFilePath,
    fileVersion,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'sb-cli',
    tags: analysis.metadata.tags,
    importance: analysis.metadata.importance,
    extractedBy: 'sb-cli@1.0.0',
    model,
    humanVerified: existingData.data?.humanVerified || false,
  };

  const content = matter.stringify(analysis.markdown, metadata);
  
  await fs.writeFile(knowledgePath, content, 'utf-8');
  
  return knowledgePath;
}

/**
 * Read existing knowledge file
 */
export async function readKnowledgeFile(
  sourceFilePath: string,
  knowledgeDir: string
): Promise<{ metadata: KnowledgeMetadata; content: string } | null> {
  const knowledgePath = getKnowledgeFilePath(sourceFilePath, knowledgeDir);
  
  if (!(await fileExists(knowledgePath))) {
    return null;
  }

  try {
    const content = await fs.readFile(knowledgePath, 'utf-8');
    const { data, content: markdown } = matter(content);
    
    return {
      metadata: data as KnowledgeMetadata,
      content: markdown,
    };
  } catch {
    return null;
  }
}

