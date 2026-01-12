---
filePath: agent/main.py
fileVersion: 9674f2f871b9b2558c7acd2b813bcfa34f2cea42
lastUpdated: '2026-01-12T00:05:33.380Z'
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
  - User can receive voice-guided onboarding through the codebase
  - User can interactively explore files with contextual assistance
  - User can get real-time feedback on their progress during onboarding
relatedFiles:
  - knowledge_loader/load_session.py
  - knowledge_loader/load_features.py
  - knowledge_loader/get_onboarding_context.py
  - knowledge_loader/get_context_for_file.py
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
This file implements a voice agent for onboarding users through a codebase, facilitating interactive conversations and providing contextual guidance.

## Problem
Before this file, onboarding users to the codebase was a manual and potentially confusing process. Users lacked immediate assistance and context about the code, leading to frustration and inefficiencies. The need arose for an automated solution that could guide users through the onboarding process interactively and intelligently.

## Solution
The `OnboardingAgent` class extends the `VoiceAgent` to handle user interactions via voice. It utilizes logging to capture significant events and user interactions, which aids in debugging and understanding user behavior. The agent builds personalized prompts based on user sessions and available context, allowing for a tailored onboarding experience. Key technical decisions include the integration of logging for monitoring and the use of various models for speech-to-text (STT), text-to-speech (TTS), and language processing (LLM).

## Impact
Users can now receive real-time assistance while navigating the codebase, significantly enhancing their onboarding experience. Developers benefit from improved insights into user interactions through logging, enabling them to refine the onboarding process and address issues proactively. This leads to a more efficient onboarding experience and higher user satisfaction.

## Architecture Context
This file is part of a larger system that includes various components for voice interaction, such as STT, TTS, and LLM models. It integrates with the LiveKit framework for real-time communication and utilizes knowledge loading functions to provide contextual information about the codebase. The agent communicates with a UI to display relevant files and information to the user.

## Gotchas (If Applicable)
- The logging functionality may introduce performance overhead, particularly if the agent processes a high volume of interactions. Ensure that logging is appropriately managed to prevent bottlenecks.
- The log file path is hardcoded, which may lead to issues if the path is not accessible or writable. Consider making this configurable to enhance flexibility.
