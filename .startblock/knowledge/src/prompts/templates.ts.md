---
filePath: src/prompts/templates.ts
fileVersion: d41e59db13aa62aec5746fa874be5a4422d7eb22
lastUpdated: '2025-12-28T17:47:07.408Z'
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
  - User can generate documentation for code changes
  - User can analyze the context of a file in a repository
relatedFiles: []
---
## Purpose
This file defines the structure and functionality for generating user prompts for OpenAI analysis based on the context of a file's state in a code repository.

## Key Functionality
- `PromptContext`: Interface that outlines the context required for generating prompts, including file path, language, and commit details.
- `generateUserPrompt`: Function that constructs a detailed prompt string for OpenAI, incorporating various contextual elements like existing documentation and changes in the commit.

## Gotchas
- The `existingDocumentation` field is optional; if not provided, the prompt will not include prior documentation, which may lead to loss of context.
- The function assumes that the `commitContext` is well-formed; if any fields are missing, it could lead to incomplete or malformed prompts.
- Care must be taken when passing `gitDiff`, as it is only relevant for modified files; passing it for new files may lead to confusion in the output.

## Dependencies
- The file relies on the structure of the `PromptContext` interface to ensure that all necessary data is provided for prompt generation. This structure is crucial for maintaining clarity and consistency in the generated prompts.

## Architecture Context
This file plays a critical role in the documentation and analysis workflow by providing a structured way to generate prompts that facilitate understanding and insights into code changes and context.

## Implementation Notes
- The addition of the `existingDocumentation` field was made to enhance the ability to preserve and enrich prior documentation, reflecting a decision to improve the documentation process.
- The prompt generation logic is designed to be extensible, allowing for future enhancements without significant refactoring.
