---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 1c8a8193940c20be934d48b3e534207d158fc6e7
lastUpdated: '2026-01-12T10:47:41.985Z'
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
  - User can receive context updates when an agent joins
  - User can interact with agents through commands
  - User can view relevant file content as requested by agents
relatedFiles:
  - '@livekit/components-react'
  - '@/components/GuidedView'
  - '@/lib/api'
---
## Purpose
This file defines a custom React hook that manages agent commands and context communication in a collaborative environment using LiveKit.

## Problem
Before this file, there was no efficient mechanism to manage context communication with agents in a collaborative setting. Agents could join at any time, and there was a risk of sending redundant context data, which could lead to performance issues and confusion.

## Solution
The `useAgentCommands` hook implements a strategy to track which participants have already received context using a Set. It sends context data only once per agent and includes functionality for periodic checks to ensure that no agents are missed. This is achieved through the use of LiveKit's data channels to communicate with agents and manage their commands effectively.

## Impact
With this implementation, users can seamlessly interact with agents in a collaborative environment without worrying about redundant data transmission. Developers benefit from a more structured approach to managing agent interactions, leading to improved performance and user experience in applications that utilize this hook.

## Architecture Context
This hook integrates with LiveKit's room and data channel contexts, allowing it to listen for participant connections and manage context sending. It fetches necessary data from the backend and sends it to agents as they join or request it, ensuring a smooth flow of information.

## Gotchas (If Applicable)
- The asynchronous nature of context sending means that if a send fails, the participant is marked for a retry, which could introduce delays in communication.
- Ensure that the identity checks for agents are comprehensive enough to avoid false negatives, as the current implementation relies on string matching.
