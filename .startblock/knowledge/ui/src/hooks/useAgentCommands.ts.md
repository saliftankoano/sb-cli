---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: 865536330a1cc5cf89f436352091701359f959dd
lastUpdated: '2026-01-12T00:54:24.050Z'
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
  - User can receive context updates when an agent joins the session
  - >-
    User can interact with agents that have immediate access to relevant session
    data
  - User can request specific files through agent commands
relatedFiles:
  - lib/api.ts
  - components/GuidedView.ts
---
## Purpose
This file provides a custom React hook that manages agent commands and context sharing in a collaborative environment.

## Problem
Before this file was implemented, agents joining a collaborative session lacked immediate access to relevant context and data, which hindered their ability to assist users effectively. The need for a mechanism that could dynamically provide context to agents as they joined prompted the creation of this hook.

## Solution
The `useAgentCommands` hook solves the problem by listening for participant connections and sending context data to agents when they join. It fetches session details, features, and knowledge files asynchronously and prepares a structured context object to be sent over a data channel. This ensures that agents have the necessary information to engage with users right from the start.

## Impact
With this implementation, agents can now receive real-time context as they join a session, improving their ability to assist users. This enhances the overall user experience by ensuring that agents are well-informed and can respond effectively to user commands. Additionally, agents can request specific files, which are then sent back to them, further streamlining interactions.

## Architecture Context
This hook integrates with the LiveKit components for real-time communication and relies on several API calls to fetch session and knowledge data. It listens for participant events and manages state related to agent commands, making it a crucial part of the collaborative architecture.

## Gotchas (If Applicable)
- The hook checks for both 'agent' and 'python' in participant identities, which may lead to unintended context sharing if not properly managed.
- Asynchronous data fetching can introduce delays; ensure that the UI handles loading states appropriately to improve user experience.
