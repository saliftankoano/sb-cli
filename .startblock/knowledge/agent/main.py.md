---
filePath: agent/main.py
fileVersion: b5cf43c5d96a9bb3a7657454d53c7f15932768b7
lastUpdated: '2026-01-12T04:10:40.740Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: codebase-onboarding
featureRole: entry_point
userFlows:
  - User can interact with the onboarding agent via voice commands
  - User can navigate through codebase files with contextual assistance
  - User can receive onboarding context dynamically during the session
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice agent for onboarding users to a codebase, facilitating voice conversations and context management during the onboarding process.

## Problem
Before this file, onboarding users to a codebase was likely a manual and less interactive process, leading to potential confusion and disengagement. The need for a more dynamic and engaging onboarding experience prompted the creation of this agent, which leverages voice interactions to guide users effectively.

## Solution
The file implements an `OnboardingAgent` that connects to a local server to receive context and file content. It listens for data messages, processes onboarding context, and allows users to navigate through files using voice commands. The agent dynamically updates its instructions based on the context received, ensuring relevant guidance is provided to users.

## Impact
Users can now engage in a more interactive onboarding experience, receiving real-time assistance and context as they explore the codebase. This leads to improved understanding and retention of information, making the onboarding process more efficient and enjoyable.

## Architecture Context
The agent connects to a local server using an audio-only channel to minimize overhead while maintaining data channels for context messages. It integrates with various components, including speech-to-text (STT), language models (LLM), and text-to-speech (TTS) systems, to facilitate voice interactions. The data flow involves receiving context from the server, processing user input, and updating the UI accordingly.

## Gotchas (If Applicable)
- If the context is not received within the specified timeout, the agent falls back to a generic mode, which may not provide the intended onboarding experience.
- The audio-only connection may limit certain functionalities, so ensure that the server is configured correctly to support the required features.
