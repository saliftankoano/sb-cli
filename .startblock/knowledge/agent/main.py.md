---
filePath: agent/main.py
fileVersion: 1b783e65430147947652a7193cf209ec2b331aa9
lastUpdated: '2026-01-12T00:54:24.047Z'
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
  - User can interact with a voice agent for onboarding guidance
  - User can navigate through codebase files with voice commands
  - User can ask questions and receive contextual answers about the codebase
relatedFiles:
  - knowledge_loader/format_features_summary.py
  - knowledge_loader/get_feature_for_file.py
  - prompts/build_system_prompt.py
  - prompts/build_greeting_prompt.py
  - prompts/build_transition_prompt.py
  - commands/NavigateCommand.py
  - commands/ShowFileCommand.py
  - commands/serialize_command.py
  - livekit/plugins/openai.py
  - livekit/plugins/silero.py
---
## Purpose
This file implements a voice agent for onboarding users through a codebase, facilitating interactive conversations and context updates during the onboarding process.

## Problem
Before this file, onboarding users to a codebase was often a static and disjointed experience, lacking real-time interaction and context. Users struggled to understand the codebase structure and relevant files, leading to confusion and inefficiency. This prompted the need for a dynamic solution that could provide immediate context and guidance.

## Solution
The file introduces an `OnboardingAgent` class that listens for user input and context messages from a local server. It updates its internal state based on the received data, allowing it to provide tailored responses and navigate through the codebase effectively. The agent employs asynchronous programming to handle real-time interactions, ensuring a responsive user experience.

## Impact
With this implementation, users can now engage in voice conversations with the agent, receive contextual information about the codebase, and navigate files seamlessly. This enhances the onboarding process by making it more interactive and informative, ultimately leading to faster acclimatization to the codebase.

## Architecture Context
The agent integrates with a local server to receive context updates and file content. It utilizes various models for speech-to-text, text-to-speech, and language understanding, ensuring a comprehensive onboarding experience. The data flow involves receiving user input, processing it, and responding with relevant information or actions based on the current context.

## Gotchas (If Applicable)
- The agent relies on accurate context messages from the server; if the server sends data on the wrong topic, it may lead to warnings or incorrect context updates.
- Performance may vary based on network conditions, particularly when requesting file content, which could introduce delays in user interactions.
