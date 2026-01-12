---
filePath: agent/main.py
fileVersion: 03fe4ddce2f75c83267bce483ab0b1b19aa5ced5
lastUpdated: '2026-01-12T21:37:30.844Z'
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
  - >-
    User can receive personalized onboarding guidance while exploring the
    codebase.
  - User can navigate through files with contextual assistance from the agent.
  - User can interact with the onboarding agent using voice commands.
relatedFiles:
  - knowledge_loader/format_features_summary.py
  - prompts/build_system_prompt.py
  - prompts/build_greeting_prompt.py
  - prompts/build_transition_prompt.py
  - commands/NavigateCommand.py
  - commands/ShowFileCommand.py
  - commands/serialize_command.py
---
## Purpose
This file implements a voice agent that facilitates onboarding for users interacting with a codebase, providing personalized guidance during the process.

## Problem
Before this file, onboarding users to a codebase was often a disjointed experience, lacking personalized guidance and context. New users faced challenges in understanding the codebase structure and features, leading to frustration and inefficiency. The need for a cohesive onboarding solution that could adapt to individual user sessions and provide relevant information prompted the creation of this file.

## Solution
This file introduces the `ContextStore` class, which manages the onboarding context by storing session data, features, and the current file being explored. It ensures that the onboarding agent only proceeds when a complete context is available, enhancing the personalization of interactions. The agent listens for context updates and file content, allowing it to adapt its guidance based on user input and the current state of the onboarding process.

## Impact
With this implementation, users can now receive tailored onboarding experiences that adapt to their specific needs and progress through the codebase. Developers benefit from a structured approach to onboarding, leading to faster ramp-up times for new team members and improved overall satisfaction with the onboarding process.

## Architecture Context
This file is part of a larger system that integrates voice interaction capabilities with a local server. It relies on asynchronous communication to handle context updates and user input, ensuring a responsive experience. The `OnboardingAgent` class utilizes the `ContextStore` to manage state and provide personalized feedback based on the user's journey through the codebase.

## Gotchas (If Applicable)
- The system requires all three key components (session, features, current file) to be present before it can proceed with personalized interactions, which may lead to timeouts if not managed correctly.
- Asynchronous context updates can introduce complexity, especially if multiple updates occur simultaneously, potentially leading to race conditions or inconsistent states.
