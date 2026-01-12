---
filePath: agent/main.py
fileVersion: 49ca73439188eec86eaa72b5a80a4e8496c0787a
lastUpdated: '2026-01-12T10:41:25.267Z'
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
  - User can interact with a voice agent for onboarding guidance
  - User can navigate through code files using voice commands
  - User receives contextual information about the codebase during onboarding
relatedFiles:
  - knowledge_loader/format_features_summary
  - knowledge_loader/get_feature_for_file
  - prompts/build_system_prompt
  - prompts/build_greeting_prompt
  - prompts/build_transition_prompt
  - commands/NavigateCommand
  - commands/ShowFileCommand
  - commands/serialize_command
---
## Purpose
This file implements a voice agent for onboarding users through a codebase, facilitating interactive voice conversations during the onboarding process.

## Problem
Before this file, onboarding users to a codebase was a manual and potentially confusing process, lacking interactive guidance. Users often struggled to understand the structure and purpose of the codebase, leading to longer onboarding times and increased frustration. This prompted the need for an automated solution that could provide real-time assistance and context-aware navigation.

## Solution
The file defines an `OnboardingAgent` class that leverages LiveKit for voice communication, allowing it to interact with users in real-time. It manages context through a `ContextStore`, which holds relevant information about the onboarding session, including the current file and features. The agent listens for transcription events to classify user intents and navigate through files, dynamically updating its instructions based on the current context. This approach allows for a more engaging and efficient onboarding experience.

## Impact
With this implementation, users can now engage with the codebase in a conversational manner, receiving immediate assistance and context as they navigate files. This significantly enhances the onboarding experience, reduces the learning curve, and allows users to become productive more quickly. Developers benefit from a structured onboarding process that can be easily modified or extended.

## Architecture Context
This file is part of a larger system that integrates voice communication and context management. It interacts with various components such as LiveKit for real-time audio and data channels, OpenAI for natural language processing, and a local server for context updates. The data flow involves receiving context from the server, processing user input, and sending commands to a UI for display.

## Gotchas (If Applicable)
- The agent requires timely context updates; if context is not received within 25 seconds, it falls back to a generic mode, which may not provide the intended onboarding experience.
- The agent's ability to classify user intent relies on the quality of transcriptions and the underlying AI model, which may introduce variability in responses.
- Ensure that the server context is correctly sent to avoid issues with the onboarding flow, as incorrect topic handling can lead to missed context updates.
