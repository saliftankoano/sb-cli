import OpenAI from "openai";
import { type SBConfig } from "../config/defaults.js";
import {
  SYSTEM_PROMPT,
  generateUserPrompt,
  type PromptContext,
} from "../prompts/templates.js";
import { sleep } from "../utils/sleep.js";

export interface AnalysisResult {
  markdown: string;
  metadata: {
    tags: string[];
    importance: "low" | "medium" | "high" | "critical";
  };
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
   * Analyze a file with OpenAI
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
      });

      const markdown = response.choices[0].message.content || "";
      const tags = this.extractTags(context);
      const importance = this.calculateImportance(context);

      return {
        markdown,
        metadata: { tags, importance },
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
}
