---
filePath: ui/src/App.tsx
fileVersion: 0bae6537356e19ed555671925e6cf9551cd0bde6
lastUpdated: '2026-01-03T02:24:27.864Z'
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
  - User can navigate through different journey steps
  - User can explore files and view details
  - User can interact with voice controls
  - User can access onboarding documents
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
This file serves as the main entry point for the application, managing both the LiveKit and non-LiveKit UI states.

## Key Functionality
- **useAppState**: A custom hook that centralizes state management for journey steps, view states, and active modes.
- **MainUI**: Renders the main application UI, adapting based on the active mode (journey, explore, knowledge).
- **LiveKitContent**: A component that integrates LiveKit functionality, rendering the UI with voice control features.
- **RegularContent**: A fallback component that renders the UI without LiveKit integration.

## Gotchas
- The useAppState hook synchronizes the active mode with the view state, but if viewState is not updated correctly, it can lead to unexpected UI behavior.
- The rendering logic is mode-dependent; switching modes without ensuring the correct view state can result in inconsistencies in the displayed content.
- Developers should be cautious with the journeySteps array, as large datasets can affect performance during rendering and navigation.

## Dependencies
- **@livekit/components-react**: Used for real-time audio and video features, essential for the application's interactive capabilities.
- **hooks/useJourney**: Central to managing the application's state related to user journeys, ensuring that the UI reflects the current user context.

## Architecture Context
This file is integral to the application's architecture, serving as the main interface for users to interact with the journey and file exploration features. It connects various components and manages state transitions effectively.

## Implementation Notes
- The separation of LiveKit and Regular content into distinct components enhances maintainability and clarity in the codebase. This pattern allows for easier updates and debugging.
- Careful consideration of performance is necessary when handling large arrays like journeySteps, as inefficient rendering can lead to a sluggish user experience. Consider memoization or virtualization techniques if performance issues arise.
