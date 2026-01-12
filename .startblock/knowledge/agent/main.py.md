---
filePath: agent/main.py
fileVersion: c1df2113c344b329032d9e7a3d0a38f14a32fdfe
lastUpdated: '2026-01-12T11:06:40.051Z'
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
  - User can interact with the codebase using voice commands
  - User can receive guided assistance while exploring the codebase
  - User can navigate through files and features with voice prompts
relatedFiles:
  - livekit/plugins/openai.py
  - livekit/plugins/silero.py
  - knowledge_loader.py
  - prompts.py
  - commands.py
---
## Purpose
This file implements a voice agent for onboarding users to a codebase, facilitating interactive voice conversations during the onboarding process.

## Problem
Before this file, onboarding users to the codebase was a manual and potentially confusing process. Users lacked a guided experience that could help them navigate the codebase effectively, leading to frustration and inefficiency. The absence of an interactive assistant meant that users had to rely solely on documentation or trial and error to understand the codebase.

## Solution
This file introduces the `OnboardingAgent`, which acts as a voice assistant to guide users through the codebase onboarding. It leverages a `ContextStore` to manage user sessions, features, and knowledge files, ensuring that relevant information is readily available. The agent listens for user input and utilizes voice commands to navigate through the codebase, making the onboarding process more engaging and efficient. Asynchronous handling of context updates and user inputs allows for a responsive interaction model.

## Impact
Users can now interact with the codebase through voice commands, making the onboarding process more intuitive and less reliant on traditional documentation. This approach enhances user engagement and allows for a more personalized learning experience. Developers benefit from a structured onboarding process that can be easily integrated into existing systems, improving overall productivity and reducing onboarding time.

## Architecture Context
The `OnboardingAgent` communicates with a local server to receive context updates and file content. It integrates with various plugins for speech-to-text (STT), text-to-speech (TTS), and natural language processing (NLP) to facilitate voice interactions. The agent operates within a room context, allowing it to manage multiple user sessions and interactions seamlessly.

## Gotchas (If Applicable)
- The asynchronous nature of context updates and user input handling can lead to timing issues if not properly synchronized, potentially causing the agent to respond with outdated information.
- Care must be taken to ensure that the correct context is maintained throughout the onboarding process, especially when handling multiple user sessions or requests for file content.
