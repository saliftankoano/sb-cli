---
filePath: agent/main.py
fileVersion: 7c9a3631c50f6bcbccd932eb9df4c4efa103cae1
lastUpdated: '2026-01-13T01:36:41.333Z'
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
    User can receive personalized onboarding instructions while navigating the
    codebase
  - >-
    User can seamlessly transition between different files in the onboarding
    process
  - User can interact with the agent using voice commands for navigation
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
# Purpose
Handles voice conversations with users during codebase onboarding, providing dynamic and context-aware guidance.

# Problem
Before this file, onboarding users to a codebase was a static process, often leading to confusion and a lack of personalized guidance. Users struggled to understand the context of the files they were navigating, which hindered their learning experience and productivity. This prompted the need for a solution that could adapt instructions based on user progress and context.

# Solution
This file implements the `OnboardingAgent` class, which dynamically updates system instructions based on the user's current file and onboarding journey. By leveraging a chat context, it ensures that users receive relevant instructions tailored to their experience level and goals. The agent interrupts ongoing replies to avoid confusion and requests file content from a server to maintain an up-to-date context. It also handles the insertion of system messages directly into the chat context, ensuring that users always have the latest guidance.

# Impact
Users can now navigate the codebase more effectively with real-time, context-sensitive instructions. This leads to a more engaging onboarding experience, allowing users to feel supported as they learn. Developers benefit from a more structured onboarding process that can be easily adapted to different user needs, improving overall efficiency and satisfaction.

# Architecture Context
The `OnboardingAgent` operates within a larger system that includes a voice interface, a chat context for real-time communication, and a server for fetching file content. It interacts with various components like the `ContextStore` for managing user context and the `AgentSession` for handling voice interactions. This integration allows for a fluid data flow between user inputs, system responses, and file content retrieval.

# Gotchas (If Applicable)
- Ensure that the system message in the chat context is updated immediately; failure to do so can lead to outdated instructions being presented to the user.
- Be mindful of potential timeouts when requesting file content from the server, as this can disrupt the onboarding flow if not handled gracefully.
