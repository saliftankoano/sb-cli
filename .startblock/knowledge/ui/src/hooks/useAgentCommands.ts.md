---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: cae485cea0c20c1ddec5afe951997e82214609ce
lastUpdated: '2026-01-12T10:54:17.426Z'
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
  - Agent can receive context data upon joining a session
  - Agent can execute commands to show files or request file contents
relatedFiles:
  - '@/components/GuidedView'
  - '@/lib/api'
---
## Purpose
This file defines a custom React hook that manages agent commands and context within a collaborative environment, facilitating communication between agents and the main application.

## Problem
Before this file existed, there was no structured way to manage the context and commands sent to agent participants in a collaborative session. Agents needed timely and relevant information to perform their tasks, but the existing system lacked a mechanism to efficiently send this data, leading to potential confusion and inefficiency.

## Solution
The `useAgentCommands` hook addresses this issue by establishing a data channel that sends context information and file contents to agents when they join a session. It fetches necessary data (session, features, knowledge files) and formats it to avoid exceeding payload limits. The hook also listens for incoming commands from agents, allowing for dynamic interactions based on their requests.

## Impact
With this implementation, agents can receive essential context and file information seamlessly, improving their ability to assist users effectively. This enhances the overall user experience in collaborative sessions, as agents are better equipped to respond to user needs and commands.

## Architecture Context
This hook integrates with the LiveKit components for real-time communication and relies on various API calls to fetch session data, features, and knowledge files. It maintains a connection to the room context and manages participant connections dynamically, ensuring that agents are updated as new participants join.

## Gotchas (If Applicable)
- The implementation is designed to avoid exceeding the 64KB limit for data payloads by stripping non-essential fields from the features data. This is crucial for maintaining performance and ensuring successful data transmission.
- The hook includes a periodic check for agents that may have joined after the initial context push, which is essential for ensuring all agents receive the necessary context, but could lead to redundant data pushes if not managed carefully.
