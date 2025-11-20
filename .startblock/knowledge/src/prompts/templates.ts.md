---
filePath: src/prompts/templates.ts
fileVersion: 73caec7ca66a98f267aa4ae1de89f334c7f2c911
lastUpdated: '2025-11-20T22:01:30.799Z'
updatedBy: sb-cli
tags:
  - src
  - prompts
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
# Knowledge Documentation for `src/prompts/templates.ts`

## Purpose
This file defines a function to generate a user prompt for analyzing TypeScript files using OpenAI's API. It structures the prompt to include file metadata, code content, and dependencies, guiding the AI to produce insightful documentation.

## Key Functionality
- **`SYSTEM_PROMPT`**: A constant string that sets the context for the AI, specifying the goals and focus areas for the analysis.
- **`PromptContext` Interface**: Defines the structure of the context object passed to the `generateUserPrompt` function, encapsulating file metadata, content, and dependencies.
- **`generateUserPrompt` Function**: Constructs a prompt string based on the provided `PromptContext`. It formats the prompt to include:
  - File path, language, and status (new or modified)
  - Git diff if applicable
  - Code content
  - Imported files and their exports
  - Dependent files that use this file

## Gotchas
- **Git Diff Handling**: The function only includes the git diff if the file is modified. If the file is new, the `gitDiff` will be ignored. Ensure that the context accurately reflects the file status to avoid confusion in the generated prompt.
- **Empty Dependencies/Dependents**: If there are no dependencies or dependents, the prompt will simply omit those sections. This is intentional but could lead to a lack of context if users expect those sections to always appear.
- **Prompt Length**: The generated prompt can become lengthy if the file has many dependencies or a large codebase. Be mindful of the token limits when sending the prompt to the AI, as exceeding limits may lead to incomplete responses.

## Dependencies
- The file does not explicitly import any dependencies but relies on TypeScript's built-in types and constructs. The `PromptContext` interface is crucial for maintaining type safety and clarity in the context object, ensuring that all necessary information is available for prompt generation.

## Architecture Context
This file fits into a larger system where automated code analysis and documentation generation are required. It serves as a bridge between code and AI, enabling developers to extract meaningful insights from their codebases efficiently. The structured prompt helps the AI understand the context better, leading to more relevant and useful outputs.

## Implementation Notes
- **Technical Decisions**: The choice to use a structured prompt with clear sections allows for targeted responses from the AI. This design decision enhances the quality of the insights generated.
- **Performance Considerations**: The function constructs the prompt in a straightforward manner, but be cautious with large files as they may lead to performance issues when generating or processing the prompt. Consider implementing pagination or chunking for very large codebases.
- **Common Mistakes**: A common mistake is to overlook the importance of accurately populating the `PromptContext`. Ensure that all fields are filled correctly to avoid generating misleading or incomplete prompts. Additionally, be cautious with the formatting of the code block to prevent syntax errors in the generated prompt.
