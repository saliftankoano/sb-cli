---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 4649027fb56e6801d1443ff8e069c9e238f5387d
lastUpdated: '2026-01-12T11:02:23.906Z'
updatedBy: sb-cli
tags:
  - ui
  - src
  - hooks
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: agent-commands
featureRole: helper
userFlows:
  - Agent can receive onboarding context when joining a session
  - Agent can request specific file content during a session
  - Agent can view relevant features and their descriptions
relatedFiles:
  - '@/components/GuidedView'
  - '@/lib/api'
---
## Purpose
This file provides a custom React hook that manages the communication of agent commands and context within a collaborative environment, ensuring agents receive necessary onboarding information efficiently.

## Problem
Prior to this implementation, there was no structured way to share onboarding context and relevant features with agents in real-time. This lack of context could lead to confusion and inefficiencies, as agents may not have had the necessary information to assist users effectively. The challenge was to ensure that agents received the right information without exceeding message size limits during communication.

## Solution
The `useAgentCommands` hook solves this problem by establishing a data channel for sending structured context to agents when they join the session. It first sends a minimal base context containing essential session information, followed by a separate message for feature details, ensuring that the total payload remains within acceptable limits. This approach allows for efficient communication and helps maintain a responsive user experience.

## Impact
With this implementation, agents can now receive timely and relevant onboarding context, which enhances their ability to assist users effectively. This structured communication also improves the overall user experience by ensuring that agents are well-informed about the session details and available features, leading to more effective interactions.

## Architecture Context
This hook integrates with the LiveKit components for real-time communication, fetching necessary session data, features, and knowledge files from the API. It listens for participant connection events and manages the state of the guided view, ensuring that all agents receive the required context dynamically as they join the session.

## Gotchas (If Applicable)
- The implementation relies on careful management of message sizes, including truncating descriptions and limiting the number of user flows and files sent to avoid exceeding the 64KB limit.
- The hook must handle dynamic participant connections, which can introduce complexity in ensuring that all agents receive the context correctly, especially if they join after the initial context push.
