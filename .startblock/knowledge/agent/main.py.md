---
filePath: agent/main.py
fileVersion: 3ce6c1c6c9627e3b5671bb1332602cba3460f58e
lastUpdated: '2026-01-12T01:10:41.285Z'
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
  - User can receive voice-guided onboarding through the codebase
  - User can navigate between files using voice commands
  - User can ask questions and receive contextual responses
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
This file implements a voice agent for onboarding users to a codebase, facilitating interactive voice conversations during the onboarding process.

## Problem
Before this file existed, onboarding users to a codebase could be a passive and confusing experience, lacking real-time interaction and context. Users often struggled to understand the structure and purpose of the codebase, leading to frustration and inefficiency. The need for a more engaging and informative onboarding process prompted the creation of this voice agent.

## Solution
The file defines an `OnboardingAgent` class that listens for context messages from a local server and processes user input to guide them through the codebase. It uses a context store to manage onboarding data, dynamically updates its instructions based on the current file and user context, and interacts with users through voice commands. This approach allows for a responsive and personalized onboarding experience, adapting to the user's journey through the codebase.

## Impact
With this file, users can now engage with a voice assistant that helps them navigate the codebase more effectively. They receive contextual information about files, can ask questions, and advance through the onboarding process at their own pace. This significantly enhances user experience and reduces the learning curve associated with new codebases.

## Architecture Context
The `OnboardingAgent` integrates with a local server to receive context data and send commands. It relies on asynchronous programming to handle user input and server communication efficiently. The agent also uses models from the OpenAI library for speech-to-text, text-to-speech, and language understanding, ensuring a smooth interaction flow.

## Gotchas (If Applicable)
- Ensure the local server is operational; otherwise, the agent will timeout and revert to a generic mode, which may not provide the intended onboarding experience.
- The agent's responsiveness can be affected by the quality of user input; ambiguous or overly brief inputs may lead to misclassification of user intent, impacting navigation flow.
