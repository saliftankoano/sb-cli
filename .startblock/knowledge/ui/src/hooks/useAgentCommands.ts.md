---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 0bae6537356e19ed555671925e6cf9551cd0bde6
lastUpdated: '2026-01-12T00:31:53.114Z'
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
  - Agent can receive real-time context when joining a session
  - Agent can request specific file content dynamically
  - Agent can navigate through commands issued by the system
relatedFiles:
  - '@livekit/components-react'
  - '@/components/GuidedView'
  - '@/lib/api'
---
## Purpose
This file defines a custom React hook that manages agent commands and context in a collaborative environment, facilitating communication between agents and the system.

## Problem
Before this hook was implemented, agents lacked a structured way to receive commands and context information in real-time, leading to inefficiencies and potential miscommunication during collaborative tasks. The need for a dynamic system that could provide agents with relevant information based on their actions prompted the creation of this hook.

## Solution
The hook leverages the LiveKit data channel to listen for commands from agents and send them relevant context upon connection. It fetches necessary session data, features, and knowledge files asynchronously, allowing agents to receive tailored information as they join the session. The use of command types enables structured interactions, allowing agents to request specific file content or receive instructions on navigating the system.

## Impact
With this hook, agents can now receive real-time context and commands, improving their efficiency and effectiveness in collaborative tasks. They can dynamically request file content, which enhances their ability to work with the system based on immediate needs. This leads to a smoother user experience and better overall performance of the collaborative environment.

## Architecture Context
This hook is part of a larger system that utilizes LiveKit for real-time communication. It interacts with various APIs to fetch session-related data and integrates with the overall application state through React's context and hooks. The data flow involves receiving commands from agents, processing them, and sending responses back through the data channel.

## Gotchas (If Applicable)
- Ensure that the command parsing logic is robust to handle unexpected message formats, as this could lead to runtime errors.
- Be aware of potential delays in fetching data from APIs, which may impact the responsiveness of the agent commands.
- The hook assumes that the agent's identity will always include the word "agent"; any deviation could lead to unexpected behavior.
