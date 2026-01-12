---
filePath: agent/main.py
fileVersion: cae485cea0c20c1ddec5afe951997e82214609ce
lastUpdated: '2026-01-12T10:54:17.420Z'
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
  - User can engage in voice conversations to navigate the codebase
  - User can receive context-aware guidance during onboarding
  - User can request specific file content and receive dynamic responses
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
This file implements a voice agent for onboarding users to a codebase, facilitating voice conversations and guiding them through the setup process.

## Problem
Before this file, users faced challenges in understanding and navigating the codebase during onboarding. The lack of an interactive assistant meant that new users had to rely on static documentation or manual guidance, which could lead to confusion and a steep learning curve.

## Solution
The file defines an `OnboardingAgent` class that uses voice interaction to assist users. It maintains an in-memory context store to keep track of user sessions, features, and current files. The agent listens for user input and can dynamically respond based on the context, allowing users to navigate the codebase more intuitively. The recent changes streamline the session initiation process by directly calling `await agent.start(ctx.room)` instead of managing the session separately, simplifying the code structure.

## Impact
With this implementation, users can engage in voice conversations to receive guidance on the codebase, making onboarding more interactive and less daunting. Developers can now create a more user-friendly onboarding experience, reducing the time it takes for new users to become productive.

## Architecture Context
This file is part of the LiveKit integration for voice interactions. It connects to a local server to receive context and file data, facilitating real-time updates and interactions. The agent operates within a data channel, allowing it to communicate effectively with the server and manage user sessions.

## Gotchas (If Applicable)
- The agent's reliance on timely context updates means that if the server fails to send context within the specified timeout, it will fall back to a generic mode, which may not provide the best user experience.
- User input classification can be tricky; ambiguous commands may lead to incorrect navigation or responses, requiring robust handling of various user intents.
