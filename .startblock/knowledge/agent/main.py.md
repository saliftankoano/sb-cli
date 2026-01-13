---
filePath: agent/main.py
fileVersion: cbe90c90a2527416352bf9abd40940ae41ef4b74
lastUpdated: '2026-01-13T09:58:02.729Z'
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
  - User can navigate to the next file in the onboarding process
  - User can return to the previous file for review
  - User receives personalized guidance based on their current context
  - User can interact with the agent using voice commands
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice agent for onboarding users through a codebase, facilitating interactive voice conversations that guide users in understanding the system.

## Problem
Before this file, users faced challenges in navigating the codebase effectively during onboarding, often leading to confusion and disengagement. The lack of an interactive guide made it difficult for users to absorb information and understand the context of different files.

## Solution
The `OnboardingAgent` class leverages voice interaction to provide real-time guidance and context-aware responses. It listens for user commands, such as "next file" or "go back," and navigates through the codebase accordingly. The agent updates its internal context based on user interactions and server responses, ensuring that the information provided is relevant and timely.

## Impact
Users can now engage with the codebase in a more dynamic way, receiving immediate feedback and assistance as they navigate through files. This enhances their learning experience by allowing them to explore the codebase at their own pace while receiving personalized guidance. Developers benefit from a more structured onboarding process, leading to quicker ramp-up times for new team members.

## Architecture Context
The `OnboardingAgent` interacts with a local server to fetch file content and context, utilizing asynchronous programming to handle user input and server responses efficiently. It integrates with various models for speech-to-text (STT), text-to-speech (TTS), and language processing, ensuring a smooth user experience.

## Gotchas (If Applicable)
- The agent interrupts ongoing responses to provide immediate feedback, which may lead to abrupt changes in conversation flow if not managed carefully.
- Navigation cooldowns are implemented to prevent users from rapidly switching contexts, which could lead to confusion. Users should be aware of this limitation during their interactions.
