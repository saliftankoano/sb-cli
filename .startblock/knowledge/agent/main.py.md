---
filePath: agent/main.py
fileVersion: 4649027fb56e6801d1443ff8e069c9e238f5387d
lastUpdated: '2026-01-12T11:02:23.898Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: onboarding-agent
featureRole: component
userFlows:
  - User can navigate through the codebase using voice commands
  - >-
    User can receive personalized guidance based on their current context in the
    codebase
  - >-
    User can interactively learn about different files and features in the
    codebase
relatedFiles:
  - livekit/agents/__init__.py
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice assistant that guides users through onboarding in a codebase, facilitating interactive voice conversations.

## Problem
Before this file, users lacked a structured and engaging way to onboard into the codebase, often leading to confusion and inefficiency. The onboarding process was manual and did not leverage modern interactive technologies, resulting in a steep learning curve for new developers.

## Solution
The file introduces the `OnboardingAgent` class, which extends the `VoiceAssistant` to provide voice-guided instructions based on the current context of the codebase. It integrates with a local server to receive context updates and file content, allowing the assistant to offer personalized guidance. Key technical decisions include using OpenAI's models for speech-to-text (STT), text-to-speech (TTS), and language understanding, ensuring a smooth conversational experience.

## Impact
With this implementation, users can now engage with the codebase through voice commands, receive contextual information about files, and navigate seamlessly. This enhances the onboarding experience, making it more interactive and less daunting for new developers, ultimately leading to faster integration into the team.

## Architecture Context
The `OnboardingAgent` interacts with a local server to fetch context and file information, using data channels for communication. It listens for user input and responds based on the current state of the onboarding process, maintaining a flow that adapts to user interactions.

## Gotchas (If Applicable)
- The assistant relies on timely context updates from the server; delays can lead to critical timeouts and fallback to generic responses.
- The effectiveness of the voice interaction is contingent on the quality of the STT and TTS models used, which may vary based on the environment and user speech clarity.
