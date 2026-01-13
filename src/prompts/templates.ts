export const SYSTEM_PROMPT = `You are a senior software engineer with a knack for explaining code in a way that is easy to understand and use. You are also great at creating knowledge documentation for team members.

Your goal: Capture the STORY behind the code - the problem it solves, WHY it was built this way, how it solves it, and what impact it has.

## CRITICAL RULES

1. **ALWAYS capture Problem/Attempts/Solution/Rationale/Impact** - this is the story that matters most
2. **PRIORITIZE THE "WHY"** - Design Rationale is the most valuable section for future developers
3. **CAPTURE FAILED ATTEMPTS** - What was tried that didn't work helps prevent others from repeating mistakes
4. **DO NOT restate what the code obviously does** - focus on WHY this approach was chosen
4. **DO NOT include Node.js built-ins in relatedFiles** (fs, path, http, crypto, os, util, child_process, stream, buffer, events, etc.) - only LOCAL project files
5. **Focus on:** What problem prompted this file, WHY this solution over alternatives, how it works, what users/developers can now do
6. **If something is straightforward**, say so briefly and move on

BAD example: "This function adds two numbers" (obvious from code, no context)
GOOD example: "Solves the problem of inconsistent number handling across the app. Chose parseFloat over parseInt because decimal precision was critical for currency. Considered using a currency library but rejected for bundle size. Enables reliable calculations in the billing module." (captures Problem → Rationale → Solution → Impact)

## INCREMENTAL DOCUMENTATION MODE

When you receive EXISTING_DOCUMENTATION, you are UPDATING, not replacing:

1. **PRESERVE** insights that are still accurate and valuable
2. **ADD** new insights discovered from the latest code changes
3. **REMOVE** only insights that are demonstrably no longer true (code deleted, behavior changed)
4. **DO NOT reword** things that don't need rewording - preserve the original voice
5. **MERGE** gotchas, don't replace the list
6. **APPEND** to implementation notes with dated updates if significant

If a section in existing docs is still accurate, keep it verbatim. Your job is to ENRICH, not rewrite.

## Feature-Aware Documentation

When documenting files, also extract:
1. **Feature ID**: Based on directory structure (e.g., app/dashboard → "dashboard-analytics")
2. **User Flows**: What USER ACTIONS does this file enable? Think from end-user perspective.
3. **Related Files**: ONLY local project files from imports - NOT node built-ins or npm packages
4. **Feature Role**: Is this an entry_point, helper, component, service, or config?

Be concise and technical. Use code examples sparingly.`;

export interface PromptContext {
  filePath: string;
  language: string;
  isNew: boolean;
  fileContent: string;
  gitDiff?: string;
  dependencies: Array<{ path: string; exports: string[] }>;
  dependents: string[];
  existingDocumentation?: string;
  commitContext?: {
    hash: string;
    message: string;
    date: Date;
    author: string;
  };
}

/**
 * Generate user prompt for OpenAI analysis
 */
export function generateUserPrompt(context: PromptContext): string {
  const {
    filePath,
    language,
    isNew,
    fileContent,
    gitDiff,
    dependencies,
    dependents,
    existingDocumentation,
    commitContext,
  } = context;

  let prompt = `Analyze this file and generate knowledge documentation.

FILE: ${filePath}
LANGUAGE: ${language}
GIT STATUS: ${isNew ? "NEW FILE" : "MODIFIED"}
`;

  if (commitContext) {
    const formattedDate = commitContext.date.toISOString();
    prompt += `COMMIT CONTEXT:
- HASH: ${commitContext.hash}
- AUTHOR: ${commitContext.author}
- DATE: ${formattedDate}
- MESSAGE: ${commitContext.message}
`;
  }

  if (existingDocumentation) {
    prompt += `\nEXISTING_DOCUMENTATION (preserve and enrich):
${existingDocumentation}
`;
  }

  if (gitDiff && !isNew) {
    prompt += `\nCHANGES IN THIS COMMIT:
\`\`\`diff
${gitDiff}
\`\`\`
`;
  }

  prompt += `\nCODE:
\`\`\`${language}
${fileContent}
\`\`\`
`;

  if (dependencies.length > 0) {
    prompt += `\nIMPORTED FILES:
${dependencies.map((d) => `- ${d.path}: ${d.exports.join(", ")}`).join("\n")}
`;
  }

  if (dependents.length > 0) {
    prompt += `\nUSED BY:
${dependents.map((d) => `- ${d}`).join("\n")}
`;
  }

  prompt += `
Return a JSON response with these fields:
1. "insights": An array of 3-5 key insights about this file as concise bullet points:
   - What problem this file solves (the WHY it exists)
   - WHY this approach was chosen over alternatives (Design Rationale)
   - How it solves the problem (the key approach)
   - What impact it has (what users/developers can now do)
   - Critical gotchas or non-obvious behaviors
2. "markdown": Full markdown documentation with these sections:

## Purpose
[What this file does - 1-2 sentences]

## Problem
[What problem does this file solve? What was the situation before this existed? What issue prompted its creation?]

## What Was Tried (If Applicable)
[What approaches were attempted that didn't work? What errors were encountered? What dead ends were explored? This prevents future developers/agents from repeating the same mistakes. Include specific error messages if relevant.]

## Solution
[How does this file solve the problem technically? What's the key approach or pattern used?]

## Design Rationale
[WHY was this approach chosen? What alternatives were considered and rejected? What trade-offs were made? This is THE MOST VALUABLE section - future developers can read code to see WHAT, they need docs to understand WHY.]

## Impact
[What can users/developers now do because of this file? How does it help the system or team?]

## Architecture Context
[How this fits in the larger system - dependencies, data flow, integration points]

## Gotchas (If Applicable)
[Non-obvious behaviors, edge cases, common mistakes, performance traps]

3. "rationale": A concise summary of WHY this approach was chosen (2-3 sentences capturing the key design decision and alternatives rejected)
4. "attemptsAndFailures": What was tried that didn't work? Failed approaches, errors encountered, dead ends (empty string if nothing failed)
6. "feature": Feature ID based on directory structure (kebab-case, e.g., "dashboard-analytics", "authentication", "mcp-integration")
7. "featureRole": One of: "entry_point", "helper", "component", "service", "config"
   - entry_point: Main files like page.tsx, route.ts, index.ts
   - helper: Utility files in utils/, helpers/
   - component: React/Vue components
   - service: Business logic in services/
   - config: Configuration files
8. "userFlows": Array of user-facing actions this file enables (think from end-user perspective)
   - Examples: "User can view analytics dashboard", "User can authenticate via OAuth"
   - NOT developer actions like "Developer can import this function"
9. "relatedFiles": Array of files imported by this file (convert relative imports to file paths)
   - Example: import { X } from './helper' → ["helper.ts"]
   - Only include files from the same repository
10. "suggestDiagramUpdate": boolean - true if this file changes the feature's architecture or user flow

Keep it concise. Focus on non-obvious knowledge. PRIORITIZE the Design Rationale section.`;

  return prompt;
}
