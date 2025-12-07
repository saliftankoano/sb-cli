export const SYSTEM_PROMPT = `You are a senior software engineer with a knack for explaining code in a way that is easy to understand and use. You are also a great at creating knowledge documentation for team members.

Your goal: Extract tacit knowledge that isn't obvious from reading the code alone.

Focus on:
- WHY decisions were made (not just WHAT the code does)
- Gotchas and edge cases
- Non-obvious behaviors
- Performance considerations
- Common mistakes to avoid

## Feature-Aware Documentation

When documenting files, also extract:
1. **Feature ID**: Based on directory structure (e.g., app/dashboard → "dashboard-analytics")
2. **User Flows**: What USER ACTIONS does this file enable? Think from end-user perspective.
3. **Related Files**: Extract from imports - convert relative imports to file paths
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
  } = context;

  let prompt = `Analyze this file and generate knowledge documentation.

FILE: ${filePath}
LANGUAGE: ${language}
GIT STATUS: ${isNew ? "NEW FILE" : "MODIFIED"}
`;

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
   - What this file does (purpose in one sentence)
   - Critical gotchas or non-obvious behaviors
   - Important performance considerations or edge cases
   - How it fits in the larger system
   - Key decisions or patterns worth noting
2. "markdown": Full markdown documentation with these sections:

## Purpose
[What this file does - 1-2 sentences]

## Key Functionality
[Main functions/classes/exports with brief descriptions]

## Gotchas
[Non-obvious behaviors, edge cases, common mistakes]

## Dependencies
[Why key dependencies are used]

## Architecture Context
[How this fits in the larger system]

## Implementation Notes
[Technical decisions, algorithms, performance considerations]

3. "feature": Feature ID based on directory structure (kebab-case, e.g., "dashboard-analytics", "authentication", "mcp-integration")
4. "featureRole": One of: "entry_point", "helper", "component", "service", "config"
   - entry_point: Main files like page.tsx, route.ts, index.ts
   - helper: Utility files in utils/, helpers/
   - component: React/Vue components
   - service: Business logic in services/
   - config: Configuration files
5. "userFlows": Array of user-facing actions this file enables (think from end-user perspective)
   - Examples: "User can view analytics dashboard", "User can authenticate via OAuth"
   - NOT developer actions like "Developer can import this function"
6. "relatedFiles": Array of files imported by this file (convert relative imports to file paths)
   - Example: import { X } from './helper' → ["helper.ts"]
   - Only include files from the same repository
7. "suggestDiagramUpdate": boolean - true if this file changes the feature's architecture or user flow

Keep it concise. Focus on non-obvious knowledge.`;

  return prompt;
}
