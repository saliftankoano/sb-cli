---
filePath: agent/main.py
fileVersion: 58f84348b1e49d79670af734ad811a0504f9e922
lastUpdated: '2025-12-16T01:02:43.091Z'
updatedBy: sb-cli
tags:
  - agent
  - python
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: startblock-onboarding
featureRole: entry_point
userFlows:
  - User can navigate through codebase files using voice commands
  - User can receive personalized greetings and guidance during onboarding
  - User can ask questions and get responses about the codebase
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
# Purpose
This file implements the LiveKit Agent for Startblock Onboarding, which manages voice conversations with users during their onboarding process with a codebase.

# Key Functionality
- `OnboardingAgent`: Main class that guides users through the onboarding process, managing the conversation flow and context.
- `get_repo_root_from_room`: Extracts the repository root from room metadata or falls back to an environment variable.
- `_advance_to_next_file`: Advances the onboarding session to the next file, updating the UI accordingly.
- `on_enter`: Initializes the session and generates a personalized greeting for the user.

# Gotchas
- If the onboarding session is not initialized correctly, many functionalities will fail without clear error messages, leading to a poor user experience.
- The `_advance_to_next_file` method must ensure that the current file index does not exceed the bounds of the selected files list, or it may result in an index error.
- The classification of user intent can be inaccurate if the user's input does not fit expected patterns, especially for medium-length messages.

# Dependencies
- The file uses various LiveKit plugins and external services (like OpenAI) to handle voice interactions, which are crucial for providing a seamless onboarding experience through voice commands.

# Architecture Context
This file serves as a core component of the onboarding system, interfacing with both the user and the backend services to facilitate real-time interactions and context-aware guidance through the codebase.

# Implementation Notes
- The agent employs a combination of STT, LLM, and TTS, which may introduce latency; careful management of these services is essential for maintaining a responsive user experience.
- The design pattern emphasizes the use of asynchronous programming with asyncio, which is critical for handling real-time user interactions without blocking the main thread.
