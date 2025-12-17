import chalk from "chalk";
import { createSpinner } from "nanospinner";
import * as fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";
import { loadConfig } from "../config/loader.js";
import {
  readKnowledgeFile,
  writeKnowledgeFile,
} from "../core/knowledge-writer.js";
import { OpenAIClient } from "../core/openai-client.js";
import {
  inferFeatureFromPath,
  inferFeatureCategory,
  inferFeatureRole,
  featureIdToName,
  updateFeatureEntry,
} from "../core/features.js";
import {
  generateMermaidFromUserFlows,
  generateMermaidJourney,
  generateMermaidSequence,
} from "../core/mermaid-generator.js";

/**
 * Extract imports from source file content
 */
function extractImports(
  fileContent: string,
  filePath: string,
  repoRoot: string
): string[] {
  const imports: string[] = [];
  const lines = fileContent.split("\n");

  for (const line of lines) {
    // Match various import patterns
    const importMatch = line.match(
      /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/
    );
    if (importMatch) {
      const importPath = importMatch[1];

      // Skip node_modules and external packages
      if (importPath.startsWith(".") || importPath.startsWith("/")) {
        // Resolve relative import
        const dir = path.dirname(filePath);
        const resolved = path.resolve(repoRoot, dir, importPath);
        const relative = path.relative(repoRoot, resolved);

        // Add common extensions if missing
        let finalPath = relative;
        if (!path.extname(finalPath)) {
          // Try common extensions
          const extensions = [".ts", ".tsx", ".js", ".jsx"];
          for (const ext of extensions) {
            const testPath = path.join(repoRoot, relative + ext);
            try {
              // Check if file exists (synchronous check via fs.accessSync would be better, but async is safer)
              // For now, just add the extension
              finalPath = relative + ext;
              break;
            } catch {
              // Continue
            }
          }
        }

        imports.push(finalPath);
      }
    }
  }

  return [...new Set(imports)]; // Remove duplicates
}

/**
 * Generate feature description using AI
 */
async function generateFeatureDescription(
  filePath: string,
  fileContent: string,
  featureName: string,
  userFlows: string[],
  openaiClient: OpenAIClient
): Promise<string> {
  const prompt = `Analyze this code file and generate a concise one-line description of what this feature does.

Feature Name: ${featureName}
File: ${filePath}

Code:
\`\`\`
${fileContent.substring(0, 2000)}${fileContent.length > 2000 ? "..." : ""}
\`\`\`

User Flows:
${userFlows.map((flow) => `- ${flow}`).join("\n")}

Generate a single, concise sentence (max 120 characters) describing what this feature enables or provides.
Focus on the value it delivers, not implementation details.
Examples:
- "Manages feature metadata and user journey visualization for onboarding"
- "Handles MCP API calls and routes requests to appropriate handlers"
- "Provides knowledge documentation management with auto-merging capabilities"

Return only the description text, no quotes or extra formatting.`;

  try {
    const response = await (openaiClient as any).client.chat.completions.create(
      {
        model: (openaiClient as any).config.openai.model,
        temperature: 0.5,
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at writing concise feature descriptions. Return only the description text, no quotes or formatting.",
          },
          { role: "user", content: prompt },
        ],
      }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return "";
    }

    // Clean up the response (remove quotes, trim)
    return content.trim().replace(/^["']|["']$/g, "");
  } catch (error) {
    console.warn(`Failed to generate description for ${filePath}:`, error);
    return "";
  }
}

/**
 * Generate user flows using AI
 */
async function generateUserFlows(
  filePath: string,
  fileContent: string,
  openaiClient: OpenAIClient
): Promise<string[]> {
  const prompt = `Analyze this code file and identify what USER-FACING ACTIONS it enables.

File: ${filePath}

Code:
\`\`\`
${fileContent.substring(0, 2000)}${fileContent.length > 2000 ? "..." : ""}
\`\`\`

Think from the END USER perspective, not developer perspective.
Examples:
- API route → "User can fetch analytics data"
- Component → "User can view dashboard charts"
- Service → "System processes payments automatically"

Return a JSON array of 1-3 user flows as strings. Be concise.`;

  try {
    const response = await (openaiClient as any).client.chat.completions.create(
      {
        model: (openaiClient as any).config.openai.model,
        temperature: 0.7,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at identifying user-facing functionality. Return only a JSON array of strings.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "user_flows",
            strict: true,
            schema: {
              type: "object",
              properties: {
                userFlows: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["userFlows"],
              additionalProperties: false,
            },
          },
        },
      }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.userFlows || [];
  } catch (error) {
    console.warn(`Failed to generate user flows for ${filePath}:`, error);
    return [];
  }
}

/**
 * Migrate existing knowledge files to include feature metadata
 */
export async function migrateFeaturesCommand(): Promise<void> {
  const repoRoot = process.cwd();
  const spinner = createSpinner(
    "Migrating knowledge files to feature-based format..."
  ).start();

  try {
    // Load config
    const config = await loadConfig(repoRoot);
    const knowledgeDir = path.join(repoRoot, config.output.knowledgeDir);

    // Check if knowledge directory exists
    try {
      await fs.access(knowledgeDir);
    } catch {
      spinner.error({
        text: chalk.red(`Knowledge directory not found: ${knowledgeDir}`),
      });
      return;
    }

    // Find all knowledge files
    spinner.update({ text: "Scanning knowledge files..." });
    const knowledgeFiles: string[] = [];

    async function findKnowledgeFiles(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await findKnowledgeFiles(fullPath);
        } else if (entry.name.endsWith(".md")) {
          knowledgeFiles.push(fullPath);
        }
      }
    }

    await findKnowledgeFiles(knowledgeDir);

    if (knowledgeFiles.length === 0) {
      spinner.success({
        text: chalk.dim("No knowledge files found to migrate."),
      });
      return;
    }

    spinner.update({
      text: `Found ${knowledgeFiles.length} knowledge file(s) to migrate...`,
    });

    // Initialize OpenAI client for user flow generation
    const openaiClient = new OpenAIClient(config);

    let migratedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < knowledgeFiles.length; i++) {
      const knowledgeFilePath = knowledgeFiles[i];
      spinner.update({
        text: `Migrating ${path.relative(knowledgeDir, knowledgeFilePath)} (${
          i + 1
        }/${knowledgeFiles.length})...`,
      });

      try {
        // Read knowledge file
        const knowledgeContent = await fs.readFile(knowledgeFilePath, "utf-8");
        const parsed = matter(knowledgeContent);
        const frontmatter = parsed.data as any;
        const content = parsed.content;

        // Extract source file path from knowledge file path
        // knowledge/app/api/route.ts.md -> app/api/route.ts
        const relativeKnowledgePath = path.relative(
          knowledgeDir,
          knowledgeFilePath
        );
        const sourceFilePath = relativeKnowledgePath.replace(/\.md$/, "");

        // Check if already has feature metadata
        /*
        if (
          frontmatter.feature &&
          frontmatter.featureRole &&
          frontmatter.userFlows
        ) {
          skippedCount++;
          continue;
        }
        */

        // Read source file to extract imports
        const sourceFilePathFull = path.join(repoRoot, sourceFilePath);
        let fileContent = "";
        let relatedFiles: string[] = [];

        try {
          fileContent = await fs.readFile(sourceFilePathFull, "utf-8");
          relatedFiles = extractImports(fileContent, sourceFilePath, repoRoot);
        } catch {
          // Source file might not exist, that's okay
        }

        // Infer feature metadata
        const feature =
          frontmatter.feature ||
          inferFeatureFromPath(sourceFilePath, frontmatter.tags);
        const featureRole =
          frontmatter.featureRole ||
          inferFeatureRole(sourceFilePath, path.basename(sourceFilePath));
        const userFlows =
          frontmatter.userFlows ||
          (await generateUserFlows(sourceFilePath, fileContent, openaiClient));

        // Update frontmatter
        const updatedFrontmatter = {
          ...frontmatter,
          feature,
          featureRole,
          userFlows,
          relatedFiles: frontmatter.relatedFiles || relatedFiles,
        };

        // Write updated knowledge file
        const updatedContent = matter.stringify(content, updatedFrontmatter);
        await fs.writeFile(knowledgeFilePath, updatedContent, "utf-8");

        // Build filesByAction: map each user flow to files involved
        const filesByAction: Record<string, string[]> = {};
        const allFiles = [sourceFilePath, ...relatedFiles];

        (userFlows as string[]).forEach((flow: string) => {
          filesByAction[flow] = allFiles;
        });

        // Generate diagrams if userFlows exist
        let mermaidDiagram: string | undefined;
        let mermaidJourney: string | undefined;
        let mermaidSequence: string | undefined;

        if (userFlows.length > 0 && Object.keys(filesByAction).length > 0) {
          const featureName = featureIdToName(feature);
          mermaidJourney = generateMermaidJourney(featureName, userFlows);
          mermaidSequence = generateMermaidSequence(
            featureName,
            userFlows,
            filesByAction,
            featureRole === "entry_point" ? sourceFilePath : undefined
          );
          // Keep legacy flowchart for backward compatibility
          mermaidDiagram = generateMermaidFromUserFlows(
            featureName,
            userFlows,
            allFiles
          );
        }

        // Generate feature description if missing
        const featureName = featureIdToName(feature);
        let description = frontmatter.description || "";
        if (!description && userFlows.length > 0) {
          description = await generateFeatureDescription(
            sourceFilePath,
            fileContent,
            featureName,
            userFlows,
            openaiClient
          );
        }

        // Update features.json
        const category = inferFeatureCategory(sourceFilePath, frontmatter.tags);
        await updateFeatureEntry(repoRoot, {
          id: feature,
          name: featureName,
          description,
          category,
          files: allFiles,
          userFlows,
          filesByAction,
          mermaidDiagram,
          mermaidJourney,
          mermaidSequence,
          tags: frontmatter.tags || [],
          entryPoint:
            featureRole === "entry_point" ? sourceFilePath : undefined,
        });

        migratedCount++;
      } catch (error: any) {
        console.warn(`Failed to migrate ${knowledgeFilePath}:`, error.message);
        skippedCount++;
      }
    }

    spinner.success({
      text: chalk.green(
        `✓ Migrated ${migratedCount} file(s), skipped ${skippedCount} file(s)`
      ),
    });

    console.log(
      chalk.cyan.bold(
        "\n✨ Feature metadata migration complete! Knowledge files now include feature information.\n"
      )
    );
  } catch (error: any) {
    spinner.error({ text: chalk.red(`Error: ${error.message}`) });
    throw error;
  }
}
