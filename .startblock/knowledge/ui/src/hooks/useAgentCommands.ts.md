---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 3ce6c1c6c9627e3b5671bb1332602cba3460f58e
lastUpdated: '2026-01-12T01:10:41.294Z'
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
  - Agent receives context about the current session and features when joining.
  - Agent can request specific file content during interactions.
relatedFiles:
  - '@livekit/components-react'
  - '@/components/GuidedView'
  - '@/lib/api'
---
## Purpose
This file provides a custom React hook that manages agent commands and context sharing in a collaborative environment.

## Problem
Before this file, there was no structured way to share context and commands with agents in real-time during collaborative sessions. Agents needed relevant information about sessions, features, and knowledge files to operate effectively, but the system lacked a mechanism to push this context dynamically upon participant connections.

## Solution
The `useAgentCommands` hook solves this problem by establishing a connection with remote participants and sending them relevant context when they join. It fetches necessary data asynchronously (session, features, knowledge) and uses a logging function to track operations and errors. The hook also listens for incoming commands from agents, allowing for responsive interactions based on user actions.

## Impact
With this file, developers can now ensure that agents are equipped with the necessary context to make informed decisions during collaborative sessions. This enhances the overall user experience by providing agents with real-time data, thereby improving the effectiveness of interactions. The logging mechanism also aids in debugging and monitoring the system's behavior.

## Architecture Context
This hook integrates with the LiveKit components for real-time communication, utilizing data channels to send and receive messages. It depends on several API functions to fetch session data and knowledge files, ensuring that agents have access to the latest information.

## Gotchas (If Applicable)
- The logging function sends data to a local endpoint, which may not be suitable for production environments without modification.
- The identification of participants includes a fallback to include those labeled as "participant," which may lead to unintended context sharing if not properly managed.
- Asynchronous data fetching can lead to race conditions if not handled carefully, especially when multiple participants connect simultaneously.
