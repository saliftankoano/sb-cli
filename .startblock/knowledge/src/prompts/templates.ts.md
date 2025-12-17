---
filePath: src/prompts/templates.ts
fileVersion: 3b416f26343e9cc1cfd6140ef640501273e1831e
lastUpdated: '2025-12-17T01:36:28.386Z'
updatedBy: sb-cli
tags:
  - src
  - prompts
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: prompts-templates
featureRole: helper
userFlows:
  - User can generate documentation for code files based on their context
  - User can analyze changes in code files with historical commit information
relatedFiles: []
---
## Purpose
This file defines a system prompt template and a function to generate user prompts for analyzing code files and generating knowledge documentation.

## Key Functionality
- `SYSTEM_PROMPT`: A template string that outlines the guidelines for generating documentation.
- `PromptContext`: An interface that structures the context needed for prompt generation, including file details and commit information.
- `generateUserPrompt(context: PromptContext)`: A function that constructs a prompt for OpenAI analysis based on the provided context.

## Gotchas
- The `commitContext` is optional; if not provided, the prompt will not include commit details, which may lead to a lack of historical context in the generated documentation.
- The function assumes that the `dependencies` and `dependents` arrays are correctly populated; if they are not, the generated prompt may lack important context about file relationships.
- Care should be taken when formatting the `gitDiff` to ensure it accurately reflects the changes; incorrect formatting can lead to confusion in the generated insights.

## Dependencies
- The file does not have external dependencies but relies on the structure of the `PromptContext` to function correctly.

## Architecture Context
This file serves as a utility for generating prompts that aid in the documentation process, fitting into a larger system that automates code analysis and documentation generation.

## Implementation Notes
- The `SYSTEM_PROMPT` string has been updated to clarify the rules for generating documentation, emphasizing the importance of non-obvious insights.
- The `commitContext` was added to enhance the context available for prompt generation, allowing for richer insights based on commit history.
