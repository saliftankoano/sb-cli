---
filePath: agent/main.py
fileVersion: 4285be8799bdc15d12625e1ae00e75a6ff1c46c4
lastUpdated: '2026-01-12T00:25:41.658Z'
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
  - User can interactively explore the codebase via voice commands
  - User can receive real-time updates and context about files
  - User can navigate through onboarding materials seamlessly
relatedFiles:
  - knowledge_loader/format_features_summary.py
  - knowledge_loader/get_feature_for_file.py
  - prompts/build_system_prompt.py
  - prompts/build_greeting_prompt.py
  - prompts/build_transition_prompt.py
  - commands/NavigateCommand.py
  - commands/ShowFileCommand.py
  - commands/serialize_command.py
  - livekit/plugins/openai.py
  - livekit/plugins/silero.py
---
## Purpose
This file implements a voice agent for onboarding users to a codebase, facilitating interactive learning through voice conversations.

## Problem
Prior to this implementation, onboarding users to a codebase was a static and often confusing process, lacking interactivity and real-time assistance. Users needed a more engaging way to learn about the codebase, which could adapt to their questions and navigation needs. The absence of a voice-driven assistant made it challenging for users to explore and understand the code effectively.

## Solution
The `OnboardingAgent` class serves as a voice agent that interacts with users during their onboarding journey. It employs an in-memory `ContextStore` to manage session data, including user details, features, and file knowledge. The agent requests file content dynamically from a local server, ensuring that users receive up-to-date information as they navigate through the codebase. By leveraging asynchronous programming, the agent can handle multiple requests and updates efficiently, providing a smooth user experience.

## Impact
With this implementation, users can now engage in a voice-guided onboarding process that adapts to their learning pace. They can ask questions, navigate through files, and receive contextual information in real-time, significantly enhancing their understanding of the codebase. Developers benefit from a more structured onboarding process that can be easily modified and extended, leading to improved onboarding outcomes.

## Architecture Context
This file is part of a larger system that integrates with LiveKit for real-time communication. It relies on various plugins, including OpenAI for language processing and Silero for voice activity detection. The data flow involves receiving user input, processing it to determine intent, and updating the context store with relevant information from the local server. The agent communicates with the frontend via data channels, sending commands to display files and receive user input.

## Gotchas (If Applicable)
- Ensure the local server is operational; otherwise, the agent will revert to a generic mode, limiting its effectiveness.
- Network latency can affect the responsiveness of file content requests, so performance may vary based on server conditions.
- The agent's ability to classify user intent relies on the quality of the input; ambiguous or lengthy messages may lead to misinterpretation of user requests.
