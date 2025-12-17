---
filePath: ui/src/hooks/useAgentCommands.ts
fileVersion: unknown
lastUpdated: '2025-12-17T01:38:41.911Z'
updatedBy: sb-cli
tags:
  - ui
  - src
  - hooks
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: agent-commands
featureRole: helper
userFlows:
  - User can navigate to different sections based on agent commands
  - User can view files with context provided by the agent
  - User can see connections related to the current context
relatedFiles:
  - '@livekit/components-react'
  - '@/components/GuidedView'
---
## Purpose
This file provides a custom React hook that manages commands from an agent, enabling dynamic updates to the UI based on received commands.

## Key Functionality
- `useAgentCommands`: A hook that initializes state for guided views and handles incoming agent commands via a data channel.

## Gotchas
- The `onMessage` function must handle both payload structures (with and without `payload` property), which could lead to parsing errors if not managed correctly.
- Ensure that the `clearGuidedState` function is called appropriately to avoid stale state issues.
- If messages are received at a high frequency, performance may be impacted due to state updates and potential re-renders.

## Dependencies
- `useDataChannel`: This hook is used to subscribe to messages on a specific topic, which is crucial for receiving agent commands in real-time.

## Architecture Context
This hook is part of a larger system that interacts with an agent, likely in a collaborative or guided user experience context, where commands dictate UI changes based on user interactions or agent suggestions.

## Implementation Notes
- The `onMessage` function includes error handling to prevent crashes from malformed messages, which is critical for maintaining application stability.
- The use of `useCallback` for `onMessage` and `clearGuidedState` ensures that these functions are not recreated on every render, optimizing performance.
