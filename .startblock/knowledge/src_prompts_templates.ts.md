---
filePath: src/prompts/templates.ts
fileVersion: 7e019c662dfbf93f083367ec7fb1cde1a1698639
lastUpdated: '2025-11-15T19:00:33.361Z'
updatedBy: sb-cli
tags:
  - src
  - prompts
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
# Knowledge Documentation for `src/prompts/templates.ts`

## Purpose
This file defines a system prompt template for generating user prompts for OpenAI analysis of TypeScript files. It encapsulates the context of the file being analyzed, including its path, language, status, content, and dependencies.

## Key Functionality
- **`SYSTEM_PROMPT`**: A constant string that serves as a template for guiding the AI in generating documentation. It outlines the expectations for the analysis, emphasizing the extraction of tacit knowledge.
  
- **`PromptContext` Interface**: Defines the structure of the context object passed to the `generateUserPrompt` function. It includes properties such as `filePath`, `language`, `isNew`, `fileContent`, `gitDiff`, `dependencies`, and `dependents`.

- **`generateUserPrompt(context: PromptContext): string`**: A function that constructs a prompt string based on the provided `PromptContext`. It formats the information into a structured prompt for OpenAI, including sections for changes, code, dependencies, and documentation structure.

## Gotchas
- **Handling of `gitDiff`**: The `gitDiff` is only included in the prompt if the file is not new. This can lead to confusion if users expect to see diffs for new files. Ensure that users understand this behavior when utilizing the function.

- **Empty Dependencies and Dependents**: If there are no dependencies or dependents, the prompt will simply omit those sections. This could lead to a lack of context for the AI if the user is unaware of the file's relationships. Consider adding a note in the documentation to clarify this behavior.

- **Markdown Formatting**: The prompt is designed to generate markdown documentation, but if the AI does not adhere to the specified sections, the output may lack clarity. Users should verify the AI's output against the expected structure.

## Dependencies
- The `dependencies` array in the `PromptContext` allows for tracking of imported files and their exports. This is crucial for understanding the context of the file being analyzed, as it provides insight into external dependencies that may affect functionality.

- The `dependents` array helps identify which files rely on the current file, facilitating a better understanding of the impact of changes made to this file.

## Architecture Context
This file is part of a larger system designed to automate the documentation process for codebases. By providing structured prompts to an AI model, it aims to enhance the quality and comprehensiveness of documentation generated for various code files, thereby improving maintainability and knowledge sharing within development teams.

## Implementation Notes
- **Conciseness and Clarity**: The design emphasizes concise and clear documentation. The AI is instructed to focus on non-obvious knowledge, which can be critical for new team members or when revisiting code after some time.

- **Performance Considerations**: The function constructs the prompt string using template literals, which is efficient for string concatenation in modern JavaScript/TypeScript. However, if the file content or dependencies are large, consider the potential performance impact on the prompt generation time.

- **Common Mistakes to Avoid**: 
  - Ensure that the `PromptContext` is fully populated before passing it to `generateUserPrompt`. Missing fields can lead to incomplete prompts.
  - Be cautious when interpreting the AI's output; it may not always align perfectly with the expected documentation structure. Regular review and iteration on the prompt template may be necessary to improve results.

## Developer Notes

