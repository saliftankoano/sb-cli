---
filePath: agent/main.py
fileVersion: 96a3368452b681d8d41372c74730e364873120e1
lastUpdated: '2026-01-13T09:32:03.057Z'
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
  - User can receive personalized onboarding guidance through voice interactions
  - User can navigate through code files with contextual assistance
  - User can ask questions and receive relevant information about the codebase
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
This file implements a voice agent for onboarding users through a codebase, facilitating interactive voice conversations during the onboarding process.

## Problem
Before this file, users lacked a structured and interactive way to onboard to the codebase, leading to confusion and a steep learning curve. The need for a guided experience prompted the creation of this voice agent, which can respond to user queries and provide contextual information about the codebase.

## Solution
The file defines an `OnboardingAgent` class that extends a voice agent, utilizing a `ContextStore` to manage session data, features, and current files. It listens for context messages from a local server and updates its state accordingly. The agent can generate personalized greetings and transition messages based on user input, enhancing the onboarding experience.

## Impact
Users can now engage with the codebase in a more intuitive manner, receiving real-time assistance and guidance as they navigate through files. This leads to improved user satisfaction and a more effective onboarding process, ultimately reducing the time required for new users to become productive.

## Architecture Context
The agent connects to a local server and listens for context updates, which it uses to inform its interactions. It integrates with various models for speech recognition and text-to-speech, ensuring smooth communication. The context store is central to managing user-specific data, which is critical for personalized interactions.

## Gotchas (If Applicable)
- The removal of debug logging may hinder troubleshooting; consider implementing alternative logging solutions for production.
- Ensure that the context waiting mechanism is robust, as timeouts can lead to generic responses if full context is not received in time. 
- Users should be aware that if they provide too few words in their input, the agent may not respond effectively, which could lead to frustration.
