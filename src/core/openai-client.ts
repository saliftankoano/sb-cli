import OpenAI from "openai";
import { type SBConfig } from "../config/defaults.js";
import {
  SYSTEM_PROMPT,
  generateUserPrompt,
  type PromptContext,
} from "../prompts/templates.js";
import { sleep } from "../utils/sleep.js";

export interface AnalysisResult {
  insights: string[]; // Key insights as numbered list for terminal display
  markdown: string;
  metadata: {
    tags: string[];
    importance: "low" | "medium" | "high" | "critical";
  };
  // Feature-aware fields
  feature?: string;
  featureRole?: "entry_point" | "helper" | "component" | "service" | "config";
  userFlows?: string[];
  relatedFiles?: string[];
  suggestDiagramUpdate?: boolean;
}

/**
 * OpenAI client wrapper for code analysis
 */
export class OpenAIClient {
  private client: OpenAI;
  private config: SBConfig;

  constructor(config: SBConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Analyze a file with OpenAI using structured JSON output
   */
  async analyze(context: PromptContext): Promise<AnalysisResult> {
    const userPrompt = generateUserPrompt(context);

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.openai.model,
        temperature: this.config.openai.temperature,
        max_tokens: this.config.openai.maxTokens,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "code_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  description:
                    "Array of 3-5 key insights about this file (purpose, gotchas, critical details)",
                  items: {
                    type: "string",
                  },
                },
                markdown: {
                  type: "string",
                  description: "Full markdown documentation with all sections",
                },
                feature: {
                  type: "string",
                  description:
                    "Feature ID based on directory structure (kebab-case)",
                },
                featureRole: {
                  type: "string",
                  enum: [
                    "entry_point",
                    "helper",
                    "component",
                    "service",
                    "config",
                  ],
                  description: "Role of this file in the feature",
                },
                userFlows: {
                  type: "array",
                  description: "User-facing actions this file enables",
                  items: {
                    type: "string",
                  },
                },
                relatedFiles: {
                  type: "array",
                  description: "Files imported by this file",
                  items: {
                    type: "string",
                  },
                },
                suggestDiagramUpdate: {
                  type: "boolean",
                  description:
                    "True if this file changes the feature's architecture",
                },
              },
              required: [
                "insights",
                "markdown",
                "feature",
                "featureRole",
                "userFlows",
                "relatedFiles",
                "suggestDiagramUpdate",
              ],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(content);

      const tags = this.extractTags(context);
      const importance = this.calculateImportance(context);

      return {
        insights: parsed.insights || ["No insights available"],
        markdown: parsed.markdown || "",
        metadata: { tags, importance },
        feature: parsed.feature,
        featureRole: parsed.featureRole,
        userFlows: parsed.userFlows || [],
        relatedFiles: parsed.relatedFiles || [],
        suggestDiagramUpdate: parsed.suggestDiagramUpdate || false,
      };
    } catch (error: any) {
      // Handle rate limiting
      if (error.status === 429) {
        console.log("Rate limited, waiting 10s...");
        await sleep(10000);
        return this.analyze(context); // Retry
      }

      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Extract tags from file path and context
   */
  private extractTags(context: PromptContext): string[] {
    const tags: string[] = [];
    const parts = context.filePath.split("/");

    // Add directory-based tags
    if (parts.length > 1) {
      tags.push(...parts.slice(0, -1).filter((p) => p.length > 0));
    }

    // Add language tag
    tags.push(context.language);

    // Add status tag
    if (context.isNew) {
      tags.push("new");
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Calculate importance based on dependencies
   */
  private calculateImportance(
    context: PromptContext
  ): "low" | "medium" | "high" | "critical" {
    const dependentCount = context.dependents.length;

    if (dependentCount >= 5) return "critical";
    if (dependentCount >= 3) return "high";
    if (dependentCount >= 1) return "medium";
    return "low";
  }

  /**
   * Select files for onboarding
   * Returns array of file paths that the LLM thinks are best for onboarding
   */
  /**
   * Pass 1: Select relevant directories based on user goal
   */
  private async selectRelevantDirectories(
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
    }
  ): Promise<string[]> {
    // Extract unique directory paths from all source files
    const allDirs = new Set<string>();
    for (const file of repoSummary.allSourceFiles) {
      const dir = file.split("/").slice(0, -1).join("/");
      if (dir) {
        allDirs.add(dir);
        // Also add parent directories
        const parts = dir.split("/");
        for (let i = 1; i < parts.length; i++) {
          allDirs.add(parts.slice(0, i).join("/"));
        }
      }
    }

    const dirList = Array.from(allDirs).sort();

    const prompt = `You are a technical mentor helping someone learn a codebase. ${
      sessionContext
        ? `The user wants to: "${sessionContext.goal}". They're at ${sessionContext.experienceLevel} level.`
        : "You're helping them understand the project."
    }

REPOSITORY STRUCTURE:
Top-level directories: ${repoSummary.structure.topLevelDirs.join(", ")}
File counts by extension: ${JSON.stringify(repoSummary.structure.fileCounts)}

ALL DIRECTORIES (${dirList.length} total):
${dirList.join("\n")}

${
  repoSummary.knowledgeFiles.length > 0
    ? `\nEXISTING KNOWLEDGE (already documented):
${repoSummary.knowledgeFiles.map((kf) => `- ${kf.sourceFile}`).join("\n")}`
    : ""
}

Your task: Select 3-5 directories that contain the most relevant files for their goal.
Focus on directories with:
- Core logic they'll need to understand or modify
- Entry points and main workflows
- Architecture patterns central to their task

Return ONLY directory paths from the list above. No files, just directories.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.openai.model,
        temperature: 0.5,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at understanding codebases. Select ONLY directories from the provided list. Return a JSON array of directory paths.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "directory_selection",
            strict: true,
            schema: {
              type: "object",
              properties: {
                directories: {
                  type: "array",
                  items: { type: "string" },
                  description: "Selected directory paths",
                },
              },
              required: ["directories"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const result = JSON.parse(content);
      return result.directories || [];
    } catch (error) {
      console.error("Error selecting directories:", error);
      return [];
    }
  }

  /**
   * Pass 2: Select specific files from relevant directories
   */
  async selectFilesForOnboarding(
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
      knowledgeFiles: Array<{
        path: string;
        sourceFile: string;
        importance?: string;
        tags?: string[];
      }>;
      allSourceFiles: string[];
    },
    maxFiles: number = 5,
    sessionContext?: {
      goal: string;
      experienceLevel: "beginner" | "intermediate" | "advanced";
      timebox?: string;
    }
  ): Promise<string[]> {
    // Pass 1: Select relevant directories
    const relevantDirs = await this.selectRelevantDirectories(
      repoSummary,
      sessionContext
    );

    if (relevantDirs.length === 0) {
      console.warn("⚠️  No relevant directories selected, using all files");
      // Fallback to all files if directory selection fails
    }

    // Filter files to only those in selected directories
    const filteredFiles =
      relevantDirs.length > 0
        ? repoSummary.allSourceFiles.filter((file) =>
            relevantDirs.some(
              (dir) => file.startsWith(dir + "/") || file === dir
            )
          )
        : repoSummary.allSourceFiles;

    console.log(
      `📁 Selected ${relevantDirs.length} directories, narrowed to ${filteredFiles.length} files`
    );

    // Pass 2: Select specific files from filtered list
    const hasKnowledgeFiles = repoSummary.knowledgeFiles.length > 0;

    let prompt = `You are a technical mentor and engineer. ${
      sessionContext
        ? `The user wants to: "${sessionContext.goal}". They're at ${
            sessionContext.experienceLevel
          } level${
            sessionContext.timebox
              ? ` with ${sessionContext.timebox} available`
              : ""
          }.`
        : "You're teaching someone this codebase."
    }

Your task: Select the ${maxFiles} most relevant files to help them accomplish their goal.

RELEVANT DIRECTORIES IDENTIFIED:
${relevantDirs.length > 0 ? relevantDirs.join(", ") : "All directories"}

AVAILABLE FILES IN THESE DIRECTORIES (${filteredFiles.length} total):
${filteredFiles.join("\n")}
`;

    if (repoSummary.documentation.readme) {
      prompt += `\n\nREADME.md (first 1000 chars):
${repoSummary.documentation.readme.substring(0, 1000)}${
        repoSummary.documentation.readme.length > 1000 ? "..." : ""
      }
`;
    }

    if (repoSummary.documentation.docs.length > 0) {
      prompt += `\n\nDocumentation files found: ${repoSummary.documentation.docs.join(
        ", "
      )}`;
    }

    if (hasKnowledgeFiles) {
      prompt += `\n\nEXISTING KNOWLEDGE FILES (${
        repoSummary.knowledgeFiles.length
      }):
${repoSummary.knowledgeFiles
  .map(
    (kf) =>
      `- ${kf.sourceFile}${
        kf.importance ? ` (importance: ${kf.importance})` : ""
      }${kf.tags ? ` [tags: ${kf.tags.join(", ")}]` : ""}`
  )
  .join("\n")}

Knowledge files already exist. Select up to ${maxFiles} undocumented files that directly support the user's goal.

What to prioritize:
- Files they'll actually need to touch or understand for their task
- Entry points and main workflows relevant to their goal
- Critical architecture pieces missing from existing knowledge
- Files that unlock understanding of the system's core patterns
`;
    } else {
      prompt += `\n\nNo knowledge files exist yet. Select ${maxFiles} files that best support the user's goal and build foundational understanding.

What to prioritize:
- Entry points they'll use (main files, initialization, routing)
- Core workflows directly related to their task
- Architectural patterns they need to understand
- Files that unlock how the system actually works
`;
    }

    prompt += `\n\n CRITICAL: You MUST select ONLY from the files listed in "AVAILABLE FILES IN THESE DIRECTORIES" above.
DO NOT infer, guess, or create file paths that aren't explicitly listed.
If a file doesn't appear in the list, it doesn't exist - don't select it.

Return a JSON array of exactly ${maxFiles} file paths from the available list.
Example format: ["lib/mcp/server.ts", "app/api/mcp/route.ts"]

Selected files:`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.openai.model,
        temperature: 0.7, // Slightly higher for creative selection
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at understanding codebases and selecting the most educational files for onboarding. You MUST select ONLY from files explicitly listed in the user's message. Never infer or create file paths. Return only a JSON array of file paths that exist in the provided list.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "file_selection",
            strict: true,
            schema: {
              type: "object",
              properties: {
                files: {
                  type: "array",
                  description: `Array of exactly ${maxFiles} file paths for onboarding`,
                  items: {
                    type: "string",
                  },
                  minItems: maxFiles,
                  maxItems: maxFiles,
                },
              },
              required: ["files"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0].message.content || '{"files": []}';
      const parsed = JSON.parse(content);
      return parsed.files || [];
    } catch (error: any) {
      // Fallback: return first maxFiles source files if AI selection fails
      console.warn(
        `AI file selection failed: ${error.message}. Using fallback selection.`
      );
      return repoSummary.allSourceFiles.slice(0, maxFiles);
    }
  }

  /**
   * Generate onboarding tasks tailored to user's goal and experience level
   */
  async generateOnboardingTasks(
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
      knowledgeFiles: Array<{
        path: string;
        sourceFile: string;
        importance?: string;
        tags?: string[];
      }>;
      allSourceFiles: string[];
    },
    selectedFiles: string[],
    sessionContext: {
      goal: string;
      experienceLevel: "beginner" | "intermediate" | "advanced";
      timebox?: string;
    }
  ): Promise<{
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
  }> {
    const prompt = `You are a technical mentor creating onboarding tasks for a developer.

USER CONTEXT:
- Goal: "${sessionContext.goal}"
- Experience Level: ${sessionContext.experienceLevel}
${sessionContext.timebox ? `- Time Available: ${sessionContext.timebox}` : ""}

REPOSITORY CONTEXT:
- Top-level directories: ${repoSummary.structure.topLevelDirs.join(", ")}
- Total source files: ${repoSummary.allSourceFiles.length}
- Files analyzed for this session: ${selectedFiles.join(", ")}

${
  repoSummary.knowledgeFiles.length > 0
    ? `- Knowledge files exist: ${repoSummary.knowledgeFiles.length} documented files`
    : "- No knowledge files yet"
}

CRITICAL REQUIREMENTS:
- Tasks MUST be specific and actionable - NO generic phrases like "explore the codebase" or "understand the system"
- Each task MUST reference specific files from the analyzed files list
- Tasks MUST directly help accomplish the user's stated goal: "${
      sessionContext.goal
    }"
- Include concrete steps, not vague descriptions
- Time estimates should be realistic for the experience level
- Beginner tasks: 30-60min, Intermediate: 1-2h, Advanced: 2h+

Generate 3 tasks per difficulty level (9 total) that are:
1. Specific to the user's goal
2. Reference actual files from: ${selectedFiles.slice(0, 10).join(", ")}${
      selectedFiles.length > 10
        ? ` (and ${selectedFiles.length - 10} more)`
        : ""
    }
3. Progressive in complexity
4. Actionable with clear steps

Return JSON with beginner, intermediate, and advanced arrays, each containing objects with: title, description, files (array of file paths), estimatedTime.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.openai.model,
        temperature: 0.7,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical mentor. Generate specific, actionable onboarding tasks that reference actual files and help users accomplish their goals. Never use generic phrases.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "onboarding_tasks",
            strict: true,
            schema: {
              type: "object",
              properties: {
                beginner: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      files: {
                        type: "array",
                        items: { type: "string" },
                      },
                      estimatedTime: { type: "string" },
                    },
                    required: [
                      "title",
                      "description",
                      "files",
                      "estimatedTime",
                    ],
                    additionalProperties: false,
                  },
                },
                intermediate: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      files: {
                        type: "array",
                        items: { type: "string" },
                      },
                      estimatedTime: { type: "string" },
                    },
                    required: [
                      "title",
                      "description",
                      "files",
                      "estimatedTime",
                    ],
                    additionalProperties: false,
                  },
                },
                advanced: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      files: {
                        type: "array",
                        items: { type: "string" },
                      },
                      estimatedTime: { type: "string" },
                    },
                    required: [
                      "title",
                      "description",
                      "files",
                      "estimatedTime",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["beginner", "intermediate", "advanced"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in response");
      }

      const parsed = JSON.parse(content);
      return {
        beginner: parsed.beginner || [],
        intermediate: parsed.intermediate || [],
        advanced: parsed.advanced || [],
      };
    } catch (error: any) {
      console.warn(
        `AI task generation failed: ${error.message}. Using fallback tasks.`
      );
      // Fallback to basic tasks if AI fails
      return {
        beginner: [
          {
            title: "Read Key Files",
            description: `Read ${selectedFiles
              .slice(0, 2)
              .join(" and ")} to understand the core structure`,
            files: selectedFiles.slice(0, 2),
            estimatedTime: "30-45min",
          },
        ],
        intermediate: [
          {
            title: "Modify a Feature",
            description: `Make a small change to ${
              selectedFiles[0] || "a key file"
            }`,
            files: selectedFiles.slice(0, 1),
            estimatedTime: "1-2h",
          },
        ],
        advanced: [
          {
            title: "Extend Functionality",
            description: `Add new functionality related to ${
              selectedFiles[0] || "the codebase"
            }`,
            files: selectedFiles.slice(0, 3),
            estimatedTime: "2h+",
          },
        ],
      };
    }
  }

  /**
   * Chat with OpenAI for general conversation
   * Used for CLI-based onboarding Q&A
   */
  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.openai.model,
        temperature: 0.7,
        max_tokens: this.config.openai.maxTokens,
        messages,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error: any) {
      if (error.status === 429) {
        console.log("Rate limited, waiting 10s...");
        await sleep(10000);
        return this.chat(messages); // Retry
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Rank features by relevance to user's goal
   * Returns feature IDs sorted by relevance with reasoning
   */
  async rankFeatures(
    goal: string,
    features: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      userFlows: string[];
      tags: string[];
    }>,
    maxResults: number = 5
  ): Promise<Array<{ id: string; reason: string }>> {
    if (features.length === 0) {
      return [];
    }

    const featuresSummary = features
      .map(
        (f) =>
          `- ID: "${f.id}", Name: "${f.name}", Category: ${f.category}${
            f.description ? `, Description: ${f.description}` : ""
          }${
            f.userFlows.length > 0
              ? `, User Flows: [${f.userFlows.join(", ")}]`
              : ""
          }${f.tags.length > 0 ? `, Tags: [${f.tags.join(", ")}]` : ""}`
      )
      .join("\n");

    const prompt = `You are helping a developer find the most relevant parts of a codebase.

USER'S GOAL: "${goal}"

AVAILABLE FEATURES:
${featuresSummary}

Select the ${Math.min(
      maxResults,
      features.length
    )} most relevant features for achieving this goal.
Consider:
- Semantic similarity (e.g., "payment" relates to "billing")
- User flows that match the goal
- Tags and category relevance
- Features the user would need to understand or modify

Return the feature IDs in order of relevance, with a brief reason for each.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.openai.model,
        temperature: 0.3, // Lower temperature for more consistent ranking
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at understanding developer intent and matching it to code features. Return only valid feature IDs from the provided list.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "feature_ranking",
            strict: true,
            schema: {
              type: "object",
              properties: {
                ranked: {
                  type: "array",
                  description: "Features ranked by relevance to the goal",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        description: "Feature ID from the provided list",
                      },
                      reason: {
                        type: "string",
                        description: "Brief reason for relevance",
                      },
                    },
                    required: ["id", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["ranked"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const parsed = JSON.parse(content);
      // Validate that returned IDs actually exist in features list
      const validIds = new Set(features.map((f) => f.id));
      return (parsed.ranked || []).filter((r: { id: string }) =>
        validIds.has(r.id)
      );
    } catch (error: any) {
      console.warn(`AI feature ranking failed: ${error.message}`);
      return [];
    }
  }
}
