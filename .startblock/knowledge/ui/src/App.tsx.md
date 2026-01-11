---
filePath: ui/src/App.tsx
fileVersion: 9674f2f871b9b2558c7acd2b813bcfa34f2cea42
lastUpdated: '2026-01-11T23:19:32.837Z'
updatedBy: sb-cli
tags:
  - ui
  - src
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: app
featureRole: entry_point
userFlows:
  - User can navigate through guided journeys
  - User can explore files from a file browser
  - User can view onboarding documentation
  - User can interact with voice controls
relatedFiles:
  - ./components/Layout
  - ./hooks/useSession
  - ./hooks/useJourney
  - ./lib/api
  - ./components/WelcomeScreen
  - ./components/VoiceControlIsland
  - ./components/GuidedView
  - ./components/SmartFileBrowser
  - ./components/JourneyProgress
  - ./components/StepNavigator
  - ./components/CommandBar
  - ./hooks/useAgentCommands
---
## Purpose
This file serves as the main entry point for the application, managing the overall layout and user interface logic for different modes of interaction.

## Problem
The application needed a cohesive way to manage different user interactions (journey, explore, knowledge) while maintaining a responsive and intuitive UI. Prior to this implementation, users may have faced confusion navigating between different functionalities, leading to a disjointed experience.

## Solution
This file implements a dynamic UI that leverages React's state management and hooks to adapt to the user's current mode. By using `useMemo`, it optimizes the rendering of the view state based on the current context, ensuring that the UI remains performant and responsive. The `MainUI` component orchestrates the rendering of various subcomponents based on the active mode, providing a seamless transition between different functionalities.

## Impact
Users can now easily switch between guided journeys and file exploration, enhancing their ability to interact with the application. This flexibility allows for a more engaging experience, as users can focus on their current task without unnecessary distractions. Developers benefit from a more organized structure that clearly separates concerns and enhances maintainability.

## Architecture Context
This file integrates with various components such as `Layout`, `GuidedView`, and `StepNavigator`, and hooks like `useSession` and `useJourney` to manage application state and user interactions. The data flow is centralized, allowing for a clear understanding of how user actions affect the UI.

## Gotchas (If Applicable)
- Ensure that the `viewState` is correctly updated to avoid displaying stale information, especially when switching modes rapidly.
- Be cautious with the memoization in `useMemo`; incorrect dependencies could lead to performance issues or stale data being rendered.
