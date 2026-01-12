---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: c1df2113c344b329032d9e7a3d0a38f14a32fdfe
lastUpdated: '2026-01-12T11:09:49.466Z'
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
  - Agent can request specific file contents during collaboration
  - Agent can view features and guided states based on commands
relatedFiles:
  - lib/api.ts
  - components/GuidedView.ts
---
## Purpose
This file defines a custom React hook that manages agent commands and context data in a collaborative environment using LiveKit.

## Problem
Before this file, there was no structured way to manage the context and commands for agent participants in a collaborative session. Agents needed relevant session data and commands to interact effectively, but the existing architecture lacked a mechanism to push this information dynamically.

## Solution
The `useAgentCommands` hook addresses this by leveraging LiveKit's data channels to send context data and handle commands from agents. It listens for participant connections, checks their identities to determine if they are agents, and pushes relevant session information, features, and file contents to them. The use of async functions and React state management ensures that updates are handled efficiently.

## Impact
With this implementation, agents can now receive real-time updates about their session context, including features and file contents, which enhances their ability to make informed decisions during collaboration. This leads to a more interactive and responsive user experience.

## Architecture Context
This hook integrates with LiveKit's participant management and data channels. It fetches session data, features, and knowledge files from the API and sends them to agents as they connect to the room. The data flow is initiated upon participant connection and is maintained through periodic checks for new agents.

## Gotchas (If Applicable)
- The debug logging added for tracking context pushes may affect performance if left in production, as it introduces additional network requests.
- The agent detection logic is permissive, which could lead to false positives if the participant identities are not well-defined, potentially causing missed context pushes.
