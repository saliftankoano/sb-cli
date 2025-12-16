---
filePath: agent/main.py
fileVersion: 57491bcac0bca1c30b9bc5ae0d853f915763fc4e
lastUpdated: '2025-12-16T01:14:10.235Z'
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
  - User can navigate through the codebase using voice commands
  - User can ask questions about the codebase and receive explanations
  - >-
    User can receive personalized onboarding guidance based on their session
    data
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice agent for onboarding users through a codebase, facilitating interactive voice conversations during the onboarding process.

## Key Functionality
- `OnboardingAgent`: Main class that manages the onboarding process and user interactions.
- `get_repo_root_from_room`: Extracts the repository root from room metadata or falls back to an environment variable.
- `entrypoint`: The entry point for the agent job, setting up the agent and handling user input.

## Gotchas
- The removal of default LiveKit credentials means that users must set the `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` environment variables; failure to do so will result in the agent not functioning properly.
- The `_advance_to_next_file` method depends on the integrity of the onboarding session; if `selectedFiles` is empty or the index is out of bounds, it may lead to errors.
- The intent classification logic may misinterpret user input if the input is ambiguous or if the user provides a mix of commands and questions.

## Dependencies
- The file imports various modules from `livekit.agents` and `livekit.plugins`, which are essential for handling voice interactions and managing the agent's state during onboarding.
- Custom functions from `knowledge_loader` and `prompts` are used to load context and build prompts, ensuring that the agent has the necessary information to assist users effectively.

## Architecture Context
This file is part of a larger system that integrates voice interactions into the onboarding process, allowing users to navigate and learn about a codebase through conversational AI. It connects to the LiveKit service for real-time communication and relies on a structured onboarding session to guide user interactions.

## Implementation Notes
- The decision to use a combination of keyword matching and LLM for intent classification balances performance and accuracy, but may introduce latency for medium-length messages.
- Extensive debug logging is present to aid in development, but it should be managed in production environments to avoid cluttering logs.
- The agent's design allows for easy extension and modification, as new features or commands can be added to the existing framework without significant refactoring.
