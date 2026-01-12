---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: b5cf43c5d96a9bb3a7657454d53c7f15932768b7
lastUpdated: '2026-01-12T04:10:40.745Z'
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
  - Agent receives context upon joining a session
  - Agent can request specific file content
  - Agent can execute commands to navigate or show files
relatedFiles:
  - '@livekit/components-react'
  - '@/components/GuidedView'
  - '@/lib/api'
---
## Purpose
This file provides a custom hook for managing agent commands and context sharing in a collaborative environment using LiveKit.

## Problem
In collaborative applications, especially those involving agents, there was a lack of efficient context sharing when agents joined a session. Prior to this implementation, agents might not receive necessary information about the session, features, or relevant files, leading to confusion and inefficiencies in their operations.

## Solution
The `useAgentCommands` hook detects when agents join a room and pushes relevant context data, including session details, features, and knowledge files. It employs the LiveKit framework to listen for participant connections and periodically checks for agents that may have connected without triggering events. This ensures that all agents receive the necessary context to operate effectively.

## Impact
With this implementation, agents can dynamically receive context and commands, allowing for improved collaboration and interaction within the application. This enhances the overall user experience by ensuring agents are well-informed and can respond to commands effectively, streamlining workflows and reducing the potential for miscommunication.

## Architecture Context
This hook integrates with the LiveKit components for managing room contexts and data channels. It fetches data from APIs to provide agents with the necessary context and listens for incoming messages to handle commands from agents. The data flow involves fetching session information, features, and knowledge files, which are then sent to agents as they join the room.

## Gotchas (If Applicable)
- The agent detection logic is permissive, which may lead to false positives if participant identities are not well-defined. Care should be taken to ensure that the naming conventions for participants are consistent.
- The periodic check for agents is set to a 5-second interval, which could lead to performance issues if there are many participants. Adjustments may be necessary based on the expected load.
