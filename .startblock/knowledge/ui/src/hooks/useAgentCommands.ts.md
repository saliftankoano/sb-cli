---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 03fe4ddce2f75c83267bce483ab0b1b19aa5ced5
lastUpdated: '2026-01-12T21:47:51.675Z'
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
  - Agent can request specific file content from the application
  - Agent can view relevant features and knowledge files dynamically
relatedFiles:
  - lib/api.ts
  - components/GuidedView.ts
---
## Purpose
This file defines a custom hook that manages agent commands and context within a collaborative environment, facilitating communication between agents and the application.

## Problem
Before this file, there was no structured way to manage interactions between agents and the application. Agents needed to receive context about the session, features, and files dynamically as they joined, which was not being handled efficiently. This led to confusion and potential miscommunication during collaborative sessions.

## Solution
The `useAgentCommands` hook solves this problem by leveraging React's state management and effects to send context to agents when they join a room. It listens for participant connections, fetches necessary data (session, features, knowledge files), and sends this information as payloads to the agents. The hook also handles commands from agents, allowing them to request specific files or show content dynamically.

## Impact
With this file, agents can now receive relevant context and commands in real-time, enhancing their ability to interact with the application effectively. This leads to a smoother onboarding experience and better collaboration, as agents can access the information they need without delays.

## Architecture Context
This hook integrates with the LiveKit components for real-time communication and relies on API calls to fetch session data and files. It operates within a React component tree, making it easy to manage state and side effects related to agent interactions.

## Gotchas (If Applicable)
- The agent detection logic is permissive, which could lead to false positives if participant identities are not carefully managed. Ensure that agent naming conventions are consistent to avoid misidentification.
- The hook relies on the reliability of the data channel for message delivery; any issues in the network can affect the communication between agents and the application.
