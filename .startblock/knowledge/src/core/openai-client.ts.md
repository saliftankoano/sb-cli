---
filePath: src/core/openai-client.ts
fileVersion: 3f944582f06fea4635c5f60f11c7429d02c5eec6
lastUpdated: '2025-11-23T21:59:29.463Z'
updatedBy: sb-cli
tags:
  - src
  - core
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
## Purpose
This file serves as a wrapper for the OpenAI client, enabling the selection of relevant directories and files for onboarding developers based on their goals and experience levels.

## Key Functionality
- `selectRelevantDirectories`: Analyzes the repository structure and user context to recommend directories.
- `selectFilesForOnboarding`: Filters files from selected directories and recommends specific files for onboarding tasks.
- `generateOnboardingTasks`: Creates actionable onboarding tasks tailored to the user's goals and experience level.
- `chat`: Facilitates general Q&A with the OpenAI model for onboarding support.

## Gotchas
- The AI's effectiveness is contingent on the prompt's clarity; vague prompts may yield suboptimal results.
- If no relevant directories are found, the system defaults to using all files, which may not align with the user's specific needs.
- The error handling for API calls only retries on rate limits; other errors will not trigger a retry, potentially leading to missed opportunities for user assistance.

## Dependencies
- The `openai` package is essential for interacting with the OpenAI API, providing the necessary methods for chat completions.
- The `sleep` utility is used to manage rate limit responses, ensuring compliance with API usage policies.

## Architecture Context
This file is part of a larger onboarding system that leverages AI to enhance the developer experience by providing tailored guidance and resources, thereby reducing the learning curve associated with new codebases.

## Implementation Notes
- The implementation uses JSON schema to validate responses from the OpenAI API, ensuring that the expected structure is adhered to.
- Performance considerations include the handling of large repositories; the directory extraction process could be optimized further if performance issues arise with very large codebases.
