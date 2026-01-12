---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 113a58529a16b39fe9be517a01456a804fc0a701
lastUpdated: '2026-01-12T10:41:25.272Z'
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
  - Agent can receive onboarding context upon joining a session
  - Agent can fetch specific file content on request
  - Agent can respond to commands from users
relatedFiles:
  - lib/api.ts
  - components/GuidedView.ts
---
## Purpose
This file provides a custom React hook that manages the communication of context and file content between a client and an agent in a collaborative environment.

## Problem
Before this file was implemented, there was no structured way to send relevant context and file content to agents joining a collaborative session. This lack of communication could lead to confusion and inefficiencies, as agents would not have the necessary information to assist users effectively.

## Solution
The `useAgentCommands` hook solves this problem by establishing a data channel for sending context and file content to agents. It sends a base context containing session details and features, followed by the content of the first selected file. This structured approach ensures that agents are onboarded with the necessary information to perform their tasks efficiently. The hook also listens for commands from agents, allowing for dynamic interactions based on user actions.

## Impact
With this implementation, agents can receive real-time context and file content, which enhances their ability to assist users in a collaborative setting. It streamlines the onboarding process for agents, allowing them to quickly access relevant files and information, thus improving overall user experience and collaboration.

## Architecture Context
This hook integrates with the LiveKit components for managing room contexts and participants. It fetches session data, features, and knowledge files from the API, ensuring that agents have the most up-to-date information upon joining. The data flow involves sending context and file content through a data channel, which is established when the hook is mounted.

## Gotchas (If Applicable)
- The hook relies on correctly identifying agent participants; if the identification logic fails, non-agent participants may be processed incorrectly.
- Sending knowledge files in chunks may introduce performance overhead if many files are involved, so monitoring the size of the payloads is important.
- The periodic check for agents may not always catch late joiners if the connection events are missed, so additional handling may be necessary for edge cases.
