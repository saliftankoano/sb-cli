---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: a65fdd93d211569e251d84bda3dc4fd46edf69d4
lastUpdated: '2026-01-12T04:20:22.725Z'
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
  - Agent can receive context when joining a session
  - Agent can request specific file content
  - Agent can trigger file display with additional information
relatedFiles:
  - '@/lib/api.ts'
  - '@/components/GuidedView.ts'
---
## Purpose
This file provides a custom React hook that manages agent commands and context within a collaborative environment, facilitating real-time communication between agents and the application.

## Problem
Before this file existed, there was no structured way to handle commands from agents in a collaborative setting. Agents needed to receive context and commands dynamically, but the system lacked a reliable mechanism to detect agents and push necessary data to them. This led to potential inefficiencies and a disjointed user experience.

## Solution
The `useAgentCommands` hook solves this problem by leveraging a data channel to send and receive commands from agents. It detects agent participants based on their identities and pushes relevant context (like session data and file content) when they join. The hook also listens for commands from agents, allowing the application to respond to requests for file content or to show specific files dynamically. This approach ensures that agents have the information they need to operate effectively within the collaborative environment.

## Impact
With this implementation, users (agents) can now receive real-time updates and commands, allowing for a more interactive and responsive experience. Developers benefit from a structured way to manage agent interactions, leading to improved collaboration and efficiency in the application. The ability to dynamically show files and respond to requests enhances the overall functionality of the system.

## Architecture Context
This hook is part of a larger system that integrates with LiveKit for real-time communication. It relies on several API calls to fetch session data, features, and knowledge files, which are essential for providing context to agents. The data flow involves sending payloads to agents and receiving commands via a dedicated data channel, ensuring seamless interaction.

## Gotchas (If Applicable)
- The agent detection logic is permissive, which could lead to incorrect identification of agents if participant identities are not standardized. This may require careful management of participant naming conventions.
- The periodic check for agents introduces potential performance overhead, especially in rooms with many participants. It's essential to balance the frequency of checks with system performance.
