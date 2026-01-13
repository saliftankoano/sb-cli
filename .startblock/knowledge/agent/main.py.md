---
filePath: agent/main.py
fileVersion: 3841cc3ec6316cac1aa3eae40dcb20eff32b855f
lastUpdated: '2026-01-13T10:20:26.969Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: codebase-onboarding
featureRole: service
userFlows:
  - User can navigate to the next file in the onboarding process
  - User can go back to the previous file during onboarding
  - User can ask general questions or confirm readiness during onboarding
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice agent for guiding users through codebase onboarding by handling voice conversations and classifying user intents.

## Problem
Before this file, onboarding users through a codebase was often confusing and inefficient, especially when users expressed their desires to navigate between files. There was no structured way to interpret user commands, leading to potential misunderstandings and frustration.

## Solution
The file introduces an `OnboardingAgent` class that listens for user input and classifies intents using OpenAI's language model. It interprets commands like "next" and "back" to facilitate smooth navigation through onboarding materials. The classification logic was enhanced to provide clearer instructions to the model, ensuring it accurately identifies user intents based on context.

## Impact
Users can now navigate through onboarding files more intuitively, with the agent responding accurately to their commands. This leads to a more engaging and efficient onboarding experience, allowing users to focus on learning rather than struggling with navigation. Developers benefit from a more robust system that can handle various user inputs effectively.

## Architecture Context
This file is part of a larger onboarding system that integrates voice recognition and AI-driven responses. It communicates with a local server to fetch file contents and update the user interface based on user interactions. The agent relies on external APIs for intent classification, which are called during user interactions.

## Gotchas (If Applicable)
- The reliance on external API calls for intent classification may introduce latency, affecting the responsiveness of the agent. 
- Ensure that the user input is concise; longer inputs may lead to delays in processing and response generation. 
- The cooldown mechanism for navigation commands prevents rapid-fire commands but may frustrate users if they are unaware of it.
