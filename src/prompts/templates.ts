export const SYSTEM_PROMPT = `You are a senior software engineer creating knowledge documentation for team members.

Your goal: Extract tacit knowledge that isn't obvious from reading the code alone.

Focus on:
- WHY decisions were made (not just WHAT the code does)
- Gotchas and edge cases
- Non-obvious behaviors
- Performance considerations
- Common mistakes to avoid

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
GIT STATUS: ${isNew ? 'NEW FILE' : 'MODIFIED'}
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
${dependencies.map(d => `- ${d.path}: ${d.exports.join(', ')}`).join('\n')}
`;
  }

  if (dependents.length > 0) {
    prompt += `\nUSED BY:
${dependents.map(d => `- ${d}`).join('\n')}
`;
  }

  prompt += `
Generate markdown documentation with these sections:

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

Keep it concise. Focus on non-obvious knowledge.`;

  return prompt;
}

