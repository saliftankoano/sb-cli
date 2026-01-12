---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 07023b8c98d540ba1d3fb47310348e9b8e5fd98c
lastUpdated: '2026-01-12T11:21:57.996Z'
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
  - Agent can receive context data upon joining a room
  - Agent can execute commands to show files or request file content
  - Agent can receive real-time updates about the session and features
relatedFiles:
  - '@/components/GuidedView'
  - '@/lib/api'
---
## Purpose
This file provides a custom hook for managing agent commands and context in a collaborative application, facilitating communication between the application and agent participants.

## Problem
In a collaborative environment, agents need to receive relevant context and commands to assist users effectively. Before this file, there was no structured way to manage and send this information to agents, leading to potential confusion and inefficiencies in agent interactions.

## Solution
The `useAgentCommands` hook fetches session data, features, and knowledge files, then sends this information to agents as they join the room. It uses a data channel to listen for commands from agents and updates the application state accordingly. The implementation includes debug logging for monitoring data flow and payload sizes to ensure efficient communication.

## Impact
With this file, agents can receive real-time context and commands, enabling them to assist users more effectively. This improves the overall user experience by ensuring that agents have the necessary information at their fingertips, leading to better interaction outcomes.

## Architecture Context
This hook integrates with the LiveKit library for real-time communication, relying on the `useRoomContext` and `useDataChannel` hooks. It fetches data from the API and sends it over a data channel to identified agent participants, ensuring a smooth flow of information.

## Gotchas (If Applicable)
- The payload size is monitored, and if it exceeds 60,000 bytes, an error is logged. This is important to prevent issues with data transmission.
- The hook handles potential errors in fetching data and sending messages, which is crucial for maintaining a robust communication system with agents.
