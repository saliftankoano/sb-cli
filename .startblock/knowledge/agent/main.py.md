---
filePath: agent/main.py
fileVersion: 4b52c4fa6fa629ffceb4380e3645508827ed2679
lastUpdated: '2026-01-12T11:21:57.991Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: codebase-onboarding
featureRole: component
userFlows:
  - User can receive real-time guidance during codebase exploration
  - >-
    User can navigate through different files in the codebase using voice
    commands
  - User can ask questions and receive answers about the codebase
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
This file implements a voice agent for onboarding users through a codebase, facilitating real-time interactions during the onboarding process.

## Problem
Before this file existed, onboarding users to a codebase was a manual and often confusing process. Users lacked guidance and context, leading to a steep learning curve and potential frustration. The need for an interactive solution that could provide real-time assistance and context during onboarding prompted the creation of this agent.

## Solution
The file defines an `OnboardingAgent` class that connects to a local server to receive context and file content dynamically. It listens for data messages, updates its internal context store, and provides voice interactions to guide users through the codebase. The agent uses a combination of speech-to-text (STT), language model (LLM), and text-to-speech (TTS) technologies to facilitate natural conversations with users.

## Impact
With this file, users can now receive personalized guidance as they explore the codebase, making the onboarding process more intuitive and efficient. Developers can leverage the voice agent to enhance user experience, leading to quicker onboarding times and better retention of information.

## Architecture Context
This file is part of a larger system that includes a local server for context management and file content delivery. It integrates with various LiveKit plugins for voice processing and utilizes asynchronous programming to handle real-time interactions. The data flow involves receiving messages from the server and responding to user inputs through a voice interface.

## Gotchas (If Applicable)
- Ensure that the server is properly configured to send context and file updates; otherwise, the agent may timeout waiting for data.
- The agent's performance can be affected by network latency, especially during context requests; consider adjusting timeout settings if users experience delays.
- The recent change to handle a single DataPacket object may require updates in how data is structured on the server side to ensure compatibility.
