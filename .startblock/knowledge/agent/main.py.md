---
filePath: agent/main.py
fileVersion: c766688c23eea47221c7fbd5175bbbd63c3c579f
lastUpdated: '2026-01-03T02:24:27.849Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: onboarding-agent
featureRole: entry_point
userFlows:
  - User can navigate through code files during onboarding
  - User can ask questions about the codebase
  - User receives personalized greetings and guidance
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
Handles voice conversations with users during codebase onboarding, guiding them through key files and features.

## Key Functionality
- `OnboardingAgent`: Main class that manages the onboarding process, including user interactions and context management.
- `get_repo_root_from_room`: Extracts the repository root from room metadata or falls back to an environment variable.
- `entrypoint`: The entry point for the agent job, setting up the necessary context and starting the session.

## Gotchas
- If the `onboarding_session` is not initialized, various methods will fail silently or produce unexpected results, especially when trying to advance files or generate prompts.
- The error handling added around `generate_reply` may lead to unobserved failures if not monitored, as the agent will continue processing without notifying the user of issues.
- The agent assumes that the first file in the selected files list is always valid; if the list is empty, it may lead to exceptions or unexpected behavior.

## Dependencies
- The `openai` plugin is used for LLM interactions, which is critical for understanding user intent and generating context-aware responses.
- `livekit` dependencies facilitate real-time voice interactions, essential for the onboarding experience.

## Architecture Context
This file is part of a larger system that integrates voice interaction capabilities into a codebase onboarding process, enhancing user engagement and learning through guided exploration of files.

## Implementation Notes
- The decision to use a voice agent allows for a more interactive onboarding experience, but it requires careful management of user input and session state.
- The use of fallback mechanisms for obtaining the repository root ensures that the agent can operate in various environments without manual configuration.
- Performance considerations include the handling of user input length to optimize LLM calls, which can be resource-intensive if not managed properly.
