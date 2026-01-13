---
filePath: agent/main.py
fileVersion: f2889786d025f91ff406d22004deeebe4c238c3c
lastUpdated: '2026-01-13T09:45:46.545Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: codebase-onboarding
featureRole: service
userFlows:
  - User can navigate to the next file in the onboarding process
  - User can go back to the previous file during onboarding
  - User receives personalized guidance based on their context and progress
relatedFiles:
  - knowledge_loader/format_features_summary
  - knowledge_loader/get_feature_for_file
  - prompts/build_system_prompt
  - prompts/build_greeting_prompt
  - prompts/build_transition_prompt
  - commands/NavigateCommand
  - commands/ShowFileCommand
  - commands/serialize_command
---
## Purpose
This file implements the OnboardingAgent, a voice-driven assistant that guides users through the onboarding process of a codebase, facilitating interactive learning and navigation.

## Problem
Before this file, users faced challenges in navigating complex codebases without guidance, leading to confusion and a steep learning curve. The lack of an interactive assistant made it difficult for users to engage with the material effectively, often resulting in frustration and disengagement.

## Solution
The OnboardingAgent addresses these issues by providing a voice interface that allows users to navigate through files in the codebase seamlessly. It incorporates a cooldown mechanism to prevent rapid navigation, ensuring that users can absorb information without feeling rushed. The agent also personalizes the experience by adapting to user context, such as their name and learning goals, which enhances engagement and relevance.

## Impact
With the OnboardingAgent, users can now navigate through the codebase using simple voice commands, making the onboarding process more intuitive and interactive. This leads to improved user satisfaction and retention, as users can learn at their own pace while receiving immediate feedback and guidance. Developers benefit from a more structured onboarding process that can be easily integrated into existing systems.

## Architecture Context
The OnboardingAgent operates within a larger system that includes voice recognition and response capabilities, leveraging models from OpenAI for speech-to-text, text-to-speech, and language understanding. It interacts with a local server to fetch file content and updates the user interface based on user commands, ensuring a dynamic and responsive experience.

## Gotchas (If Applicable)
- The cooldown mechanism for navigation commands may lead to user frustration if they are unaware of the delay, so clear communication is essential.
- Asynchronous handling of file requests means that users may experience brief delays in content loading, which should be managed with appropriate UI feedback.
- The agent's performance may vary based on the quality of voice recognition and the complexity of user commands, necessitating robust error handling and user guidance.
