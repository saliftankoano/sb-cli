---
filePath: agent/main.py
fileVersion: a65fdd93d211569e251d84bda3dc4fd46edf69d4
lastUpdated: '2026-01-12T04:20:22.718Z'
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
  - User can navigate through code files using voice commands
  - User can receive contextual information about the codebase
  - User can ask questions and get real-time assistance during onboarding
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
This file implements a voice agent for onboarding users to a codebase, facilitating voice conversations and providing context-aware assistance during the onboarding process.

## Problem
Before this file, onboarding new developers to the codebase was a manual and potentially confusing process, lacking interactive guidance. Users often struggled to understand the structure and functionality of the codebase, leading to longer ramp-up times and frustration.

## Solution
This file introduces an onboarding agent that connects to a local server to receive context about the codebase and facilitate voice interactions. It uses various models for speech-to-text (STT), text-to-speech (TTS), and language understanding (LLM) to provide real-time assistance and guidance. The agent can request file content dynamically and update its instructions based on the current context, ensuring that users receive relevant information as they navigate through the codebase.

## Impact
With this file, users can now engage in voice-guided onboarding sessions, allowing for a more interactive and efficient learning experience. Developers can quickly navigate through files, ask questions, and receive contextual information, significantly reducing the time it takes to become productive in the codebase.

## Architecture Context
The onboarding agent interacts with a local server to receive context and file data, integrating with various models from the LiveKit and OpenAI libraries. It listens for user input and updates its internal state based on the context received, ensuring a seamless flow of information and interaction.

## Gotchas (If Applicable)
- The change from 'SubscribeOptions' to 'AutoSubscribe' may require developers to review their understanding of subscription mechanisms in the context of this agent.
- Timeout settings for context retrieval and file requests can lead to delays in onboarding if the server is slow to respond, which may affect user experience.
