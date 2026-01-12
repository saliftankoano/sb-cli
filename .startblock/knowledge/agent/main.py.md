---
filePath: agent/main.py
fileVersion: 0a0a33de14031cf09ed44c4d8d337f7d57de3a49
lastUpdated: '2026-01-12T22:13:27.190Z'
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
  - User can navigate through codebase files using voice commands
  - >-
    User receives personalized onboarding instructions based on their current
    context
  - User can ask questions and receive guidance about specific files
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
This file implements a voice agent for onboarding users with a codebase, facilitating voice conversations and guiding users through their learning journey.

## Problem
Before this file, onboarding users with complex codebases was challenging, often leading to confusion and frustration. Users lacked a structured way to navigate files and understand the context of their tasks, which hindered their learning and productivity.

## Solution
The `OnboardingAgent` class serves as a voice assistant that interacts with users in real-time. It requests file contents from a local server, updates its internal context based on user interactions, and generates personalized instructions. This dynamic approach ensures that users receive relevant guidance tailored to their current task and experience level.

## Impact
With this implementation, users can seamlessly navigate through codebases using voice commands, receive contextual information about files, and get personalized onboarding experiences. This not only enhances user engagement but also accelerates the learning curve for new developers.

## Architecture Context
The agent operates within a local server environment, utilizing data channels to communicate with the server for context updates and file requests. It relies on various models for speech-to-text (STT), text-to-speech (TTS), and language processing (LLM) to facilitate interactive conversations.

## Gotchas (If Applicable)
- The timeout for file requests has been reduced to 3 seconds; this may lead to more frequent timeouts in slower network conditions, affecting user experience.
- Ensure that the context is fully initialized before interacting with the agent; otherwise, users may receive generic responses.
- The agent's ability to classify user intent is dependent on the quality of the input; short or unclear commands may not trigger the expected navigation actions.
