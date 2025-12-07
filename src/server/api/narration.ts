import { Router } from "express";
import OpenAI from "openai";
import { loadConfig } from "../../config/loader.js";
import { readSession } from "../../utils/onboarding-session.js";
import * as path from "path";
import * as fs from "fs/promises";
import matter from "gray-matter";
import { fileExists } from "../../utils/file-utils.js";

interface NarrationRequest {
  section?: string;
  context?: Record<string, any>;
}

export function setupNarrationRoutes(
  repoRoot: string,
  options: { noVoice: boolean }
): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    try {
      if (options.noVoice) {
        return res.status(503).json({ error: "Voice narration is disabled" });
      }

      const config = await loadConfig(repoRoot);

      if (!config.openai.apiKey) {
        return res.status(400).json({ error: "OpenAI API key not configured" });
      }

      const openai = new OpenAI({ apiKey: config.openai.apiKey });
      const session = await readSession(repoRoot);
      const { section, context } = req.body as NarrationRequest;

      // Load knowledge files for context
      const knowledgeDir = path.join(repoRoot, config.output.knowledgeDir);
      const knowledgeSummaries: string[] = [];

      if (await fileExists(knowledgeDir)) {
        const knowledgeFiles: string[] = [];
        await findKnowledgeFilesRecursive(knowledgeDir, knowledgeFiles);

        for (const filePath of knowledgeFiles.slice(0, 10)) {
          try {
            const content = await fs.readFile(filePath, "utf-8");
            const { data, content: markdown } = matter(content);
            const relativePath = path.relative(knowledgeDir, filePath);
            const sourceFile = relativePath.replace(/\.md$/, "");

            // Extract purpose section
            const purposeMatch = markdown.match(
              /##\s+Purpose\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
            );
            const purpose = purposeMatch
              ? purposeMatch[1].trim().slice(0, 200)
              : "";

            if (purpose) {
              knowledgeSummaries.push(`- ${sourceFile}: ${purpose}`);
            }
          } catch {
            // Skip files that can't be parsed
          }
        }
      }

      // Generate narration script
      const userName = session?.userName || "Developer";
      const goal = session?.goal || "understand the codebase";
      const experienceLevel = session?.experienceLevel || "intermediate";
      const timebox = session?.timebox || "flexible";

      const systemPrompt = `You are a friendly senior developer giving a personalized codebase tour. 
Create a warm, conversational narration script for visual onboarding. 
Be encouraging and focus on helping the user accomplish their specific goal.
Include timing cues: [PAUSE] for natural pauses, [HIGHLIGHT: filename] to highlight specific files.
Target length: 3-5 minutes for a full walkthrough, or 30-60 seconds for specific sections.`;

      const userPrompt = section
        ? `Generate narration for section: ${section}

User: ${userName}
Goal: ${goal}
Experience: ${experienceLevel}
Time available: ${timebox}

${JSON.stringify(context || {}, null, 2)}

Create a concise narration script with timing cues.`
        : `Generate a full onboarding narration script.

User: ${userName}
Goal: ${goal}
Experience: ${experienceLevel}
Time available: ${timebox}

Key files to cover:
${knowledgeSummaries.join("\n")}

Create a 3-5 minute narration script that:
1. Welcomes the user by name
2. Explains what we'll explore based on their goal
3. Highlights key files and their purposes
4. Provides encouragement and next steps
5. Uses [PAUSE] and [HIGHLIGHT: filename] cues for UI synchronization`;

      const completion = await openai.chat.completions.create({
        model: config.openai.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const script = completion.choices[0]?.message?.content || "";

      // Convert script to audio using OpenAI TTS
      const audioResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: script
          .replace(/\[PAUSE\]/g, ".")
          .replace(/\[HIGHLIGHT:[^\]]+\]/g, ""),
      });

      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      const base64Audio = audioBuffer.toString("base64");

      res.json({
        script,
        audio: `data:audio/mp3;base64,${base64Audio}`,
        duration: estimateDuration(script),
      });
    } catch (error: any) {
      console.error("Narration error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

/**
 * Recursively find all .md files in knowledge directory
 */
async function findKnowledgeFilesRecursive(
  dir: string,
  files: string[]
): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await findKnowledgeFilesRecursive(fullPath, files);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Estimate audio duration (rough: ~150 words per minute)
 */
function estimateDuration(script: string): number {
  const words = script.split(/\s+/).length;
  const minutes = words / 150;
  return Math.ceil(minutes * 60); // Return in seconds
}
