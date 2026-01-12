---
filePath: agent/main.py
fileVersion: 1c8a8193940c20be934d48b3e534207d158fc6e7
lastUpdated: '2026-01-12T10:47:41.981Z'
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
  - User can interact with the onboarding process using voice commands
  - User can receive contextual guidance while navigating the codebase
  - User can view specific files and their explanations during onboarding
relatedFiles:
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice-driven agent for onboarding users to a codebase, facilitating interactive conversations and navigation through the codebase.

## Problem
Before this file, users lacked an interactive and engaging method to onboard to the codebase, often leading to confusion and disengagement. The need for a system that could assist users in real-time during their onboarding journey prompted the creation of this file.

## Solution
The file defines an `OnboardingAgent` class that manages voice interactions, context storage, and file navigation. It uses asynchronous programming to handle user input and context updates efficiently. The agent listens for voice commands and updates its internal state based on the context received from a local server, allowing for dynamic responses and guidance.

## Impact
With this implementation, users can now interact with the onboarding process through voice commands, making it more intuitive and engaging. Developers benefit from a structured approach to onboarding, which can lead to faster ramp-up times for new team members and improved overall user satisfaction.

## Architecture Context
This file integrates with the LiveKit framework for real-time audio communication and uses plugins for speech-to-text, text-to-speech, and language model interactions. It communicates with a local server to fetch context and file data, ensuring that the onboarding experience is tailored to the user's current position in the codebase.

## Gotchas (If Applicable)
- The initialization of the agent session requires both the agent and the room context, which may lead to errors if not properly set up.
- There are timeouts for waiting on context and file requests; if these timeouts are reached, the agent may fall back to a generic mode, which could confuse users expecting a guided experience.
