---
filePath: agent/main.py
fileVersion: 474ace06496583ff3a6f662dfa4a088dd6756e94
lastUpdated: '2026-01-13T01:57:43.385Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: onboarding-agent
featureRole: service
userFlows:
  - >-
    User can receive personalized onboarding guidance based on their current
    context.
  - User can explore codebase files with relevant explanations and transitions.
  - >-
    User can interact with the agent using voice commands to navigate through
    the onboarding process.
relatedFiles:
  - knowledge_loader/format_features_summary.py
  - knowledge_loader/get_feature_for_file.py
  - prompts/build_system_prompt.py
  - prompts/build_greeting_prompt.py
  - prompts/build_transition_prompt.py
  - commands/NavigateCommand.py
  - commands/ShowFileCommand.py
  - commands/serialize_command.py
---
## Purpose
This file implements the LiveKit Agent for onboarding users through voice interactions during codebase exploration.

## Problem
Before this file, there was no structured way to manage user context during onboarding sessions, leading to generic and unengaging interactions. Users needed a more personalized experience to effectively learn about the codebase, which was not possible without tracking session details, features, and current files.

## Solution
The file introduces the `OnboardingAgent` class, which manages user interactions and context through an in-memory `ContextStore`. It updates the context with session data, features, and current files, allowing the agent to generate personalized responses. Debug logging has been added to facilitate monitoring and troubleshooting of context updates and user greetings.

## Impact
Users can now receive tailored onboarding experiences that adapt based on their current context, enhancing their understanding of the codebase. Developers benefit from a structured approach to managing user sessions and interactions, leading to improved engagement and learning outcomes. The debug logging also aids in maintaining the system's reliability.

## Architecture Context
This file is part of a larger system that uses LiveKit for real-time communication. It integrates with various models for speech recognition, language processing, and text-to-speech, ensuring a seamless interaction flow. The context management is crucial for the onboarding process, as it allows the agent to respond appropriately based on the user's journey through the codebase.

## Gotchas (If Applicable)
- The agent waits for full context (session, features, and current file) before generating personalized responses. If the context is incomplete, it may fall back to generic responses, which could confuse users.
- Debug logs are written to a specific file path, which may need to be adjusted for different environments to avoid permission issues or path errors.
