---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: b79c9dd83798f8eef0562d197c97bd965b391ee2
lastUpdated: '2026-01-13T11:14:54.015Z'
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
rationale: >-
  The use of React hooks allows for a more concise and manageable way to handle
  state and side effects compared to class components. The context push
  mechanism was implemented to ensure agents receive necessary data immediately
  upon joining, which is critical for real-time collaboration.
attemptsAndFailures: ''
feature: agent-commands
featureRole: helper
userFlows:
  - Agent can receive commands to navigate or show files
  - Agent can request file content dynamically
  - Agent can be updated with context when joining a session
relatedFiles:
  - ../components/GuidedView.ts
  - ../lib/api.ts
---
# Purpose
This file provides a custom React hook that manages agent commands and context synchronization in a collaborative environment.

## Problem
Before this hook was implemented, there was no structured way to manage the context and commands for agents joining a collaborative session. Agents needed to receive relevant data immediately upon joining, but the existing architecture did not facilitate this efficiently, leading to potential delays and confusion.

## What Was Tried (If Applicable)
No specific failed attempts are documented for this implementation. The approach taken was a result of iterative development based on the need for real-time context sharing and command handling for agents.

## Solution
The `useAgentCommands` hook utilizes React's state and effect hooks to manage the agent's context and commands. It listens for participant connections, sends context data when agents join, and handles incoming commands dynamically. This ensures that agents are always up-to-date with the necessary information to perform their tasks.

## Design Rationale
This approach was chosen to leverage React's functional programming paradigm, which simplifies state management and side effects through hooks. Alternatives such as class components were considered but rejected due to their complexity and verbosity. The decision to implement a context push mechanism allows for immediate data synchronization, which is essential for maintaining an interactive experience in real-time collaborative applications.

## Impact
With this implementation, agents can now receive context and commands in real-time, significantly improving their ability to interact with the application. This enhances user experience by ensuring that agents are equipped with the latest information as they join the session.

## Architecture Context
This hook integrates with the LiveKit components for managing room contexts and data channels. It relies on external API calls to fetch session data, features, and knowledge files, ensuring that agents have the necessary context to operate effectively.

## Gotchas (If Applicable)
Ensure that the `isReady` state is properly managed to avoid agents acting on incomplete data. Additionally, be cautious of the participant identity checks to ensure that only relevant participants are treated as agents.
