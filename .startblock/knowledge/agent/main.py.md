---
filePath: agent/main.py
fileVersion: fe2a185687a6a6ffbea8c862bce9765b2b31a313
lastUpdated: '2026-01-13T01:45:48.870Z'
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
  - User can receive personalized guidance during codebase onboarding
  - User can navigate through files with voice commands
  - User can ask questions and receive context-aware responses
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
This file implements a voice agent for guiding users through codebase onboarding, facilitating interactive learning through voice conversations.

## Problem
Prior to this implementation, onboarding users to a codebase was static and lacked personalization, leading to ineffective learning experiences. Users often struggled to navigate the codebase without tailored guidance, resulting in frustration and decreased productivity.

## Solution
The `OnboardingAgent` class dynamically updates its instructions based on the user's session context and the current file being explored. It uses a context store to maintain session data, including user goals and experience levels, allowing the agent to provide relevant information and guidance. This approach ensures that the onboarding experience is tailored to each user's needs, adapting as they progress through the codebase.

## Impact
With this file, users can now engage in a more interactive and personalized onboarding experience. The agent can respond to user inputs in real-time, guiding them through the codebase effectively. This leads to improved user satisfaction and a more efficient learning process, ultimately enhancing productivity.

## Architecture Context
The `OnboardingAgent` operates within a broader system that includes voice recognition and synthesis components, as well as a data channel for communication with a local server. It integrates with various plugins for speech-to-text (STT) and text-to-speech (TTS) functionalities, ensuring a seamless user experience. The context store plays a critical role in managing user sessions and knowledge files, facilitating data flow between the agent and the server.

## Gotchas (If Applicable)
- The agent's ability to update the chat context is dependent on the SDK version in use; failure to handle this correctly may lead to inconsistent behavior.
- Users should be aware that if the context is not fully established (session, features, and current file), the onboarding experience may revert to a generic mode, which could diminish the effectiveness of the guidance provided.
