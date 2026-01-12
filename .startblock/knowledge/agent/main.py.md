---
filePath: agent/main.py
fileVersion: 113a58529a16b39fe9be517a01456a804fc0a701
lastUpdated: '2026-01-12T04:26:56.731Z'
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
  - User can receive voice-guided onboarding through the codebase
  - User can navigate files with contextual assistance
  - User can ask questions and receive relevant responses during onboarding
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice agent for onboarding users to a codebase, facilitating voice conversations and providing contextual guidance.

## Problem
The onboarding process for users interacting with a codebase can be overwhelming, especially for those unfamiliar with its structure and functionality. Prior to this implementation, users lacked a dynamic and interactive way to receive guidance, leading to confusion and a steep learning curve.

## Solution
This file introduces the `OnboardingAgent`, a voice agent that communicates with users and guides them through the onboarding process. It listens for context from a local server, updates its internal instructions based on user interactions, and generates personalized responses. Key technical decisions include the use of asynchronous programming to handle real-time interactions and the integration of various models for speech-to-text (STT), text-to-speech (TTS), and language processing (LLM).

## Impact
With this implementation, users can now engage with the onboarding process in a more interactive manner. They receive tailored guidance based on their context and can navigate the codebase more effectively. This leads to improved user satisfaction and a more efficient onboarding experience.

## Architecture Context
The `OnboardingAgent` interacts with a local server to receive context and file content, utilizing a data channel for communication. It integrates with various AI models for processing user input and generating responses, ensuring a seamless flow of information.

## Gotchas (If Applicable)
- If the context from the server is not received in a timely manner, the agent falls back to a generic mode, which may not provide the desired level of assistance.
- Users must be aware that the agent's effectiveness relies on the quality of the context provided by the local server, which can vary based on server performance.
