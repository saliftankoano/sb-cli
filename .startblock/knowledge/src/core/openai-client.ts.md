---
filePath: src/core/openai-client.ts
fileVersion: 3b416f26343e9cc1cfd6140ef640501273e1831e
lastUpdated: '2025-12-28T17:47:07.403Z'
updatedBy: sb-cli
tags:
  - src
  - core
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: openai-client
featureRole: service
userFlows:
  - User can analyze multiple files for insights
  - User can generate onboarding tasks based on their goals
relatedFiles:
  - ../config/defaults.js
  - ../prompts/templates.js
  - ../utils/sleep.js
---
## Purpose
This file serves as a wrapper for the OpenAI API, facilitating code analysis and onboarding task generation based on user context and repository structure.

## Key Functionality
- `analyze(context: PromptContext)`: Analyzes a single file and returns structured insights.
- `analyzeBatch(files: Array<{ filePath: string; context: PromptContext }>)`: Analyzes multiple files sequentially, respecting rate limits.
- `generateOnboardingTasks(...)`: Creates tailored onboarding tasks based on user goals and experience levels.

## Gotchas
- The `analyzeBatch` method continues processing even if some analyses fail, which can lead to incomplete results without explicit error handling for the caller.
- Rate limiting is handled in the `analyze` method, which retries after a delay; however, excessive retries could lead to longer processing times, potentially impacting user experience.

## Dependencies
- The OpenAI client is used to interact with the OpenAI API, leveraging its capabilities for generating insights and tasks based on code analysis.
- Utility functions like `sleep` are used to manage delays during rate limiting, ensuring compliance with API usage policies.

## Architecture Context
This file is a service component within the larger system, responsible for integrating AI capabilities into the onboarding process, enabling users to effectively understand and navigate the codebase.

## Implementation Notes
- The decision to process file analyses sequentially was made to avoid hitting API rate limits, which is crucial for maintaining service reliability. Future improvements could explore parallel processing, but this would require careful consideration of rate limits and context management.
- The `analyzeBatch` method is designed with extensibility in mind, allowing for potential future enhancements like batching requests into a single prompt for efficiency.
