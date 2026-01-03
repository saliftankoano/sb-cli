---
filePath: ui/src/components/JourneyProgress.tsx
fileVersion: unknown
lastUpdated: '2026-01-03T02:24:27.868Z'
updatedBy: sb-cli
tags:
  - ui
  - src
  - components
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: journey-progress
featureRole: component
userFlows:
  - User can view their current step in the onboarding journey
  - User can see the overall completion percentage of the onboarding process
  - User can visually track their progress through a series of steps
relatedFiles:
  - ui/src/components/JourneyProgress.tsx
---
## Purpose
This file defines a React component that visually represents the progress of a user's journey through a series of steps, displaying the current step, total steps, and completion percentage.

## Key Functionality
- `JourneyProgress`: A functional component that accepts props for `currentStep`, `totalSteps`, `completedSteps`, and `title`, and renders the progress UI.

## Gotchas
- The `completedSteps` must not exceed `totalSteps`, or the visual representation may become misleading. Ensure that the data passed to the component is validated before rendering.
- The shimmer effect on the progress bar may cause performance issues if the component is frequently re-rendered with rapidly changing progress values. Consider debouncing updates to the progress state.

## Dependencies
- `framer-motion`: Used for smooth animations of the progress bar, enhancing user experience but requiring careful management to avoid performance pitfalls.
- `@phosphor-icons/react`: Provides icons for visual cues, improving the UI's clarity and engagement.

## Architecture Context
This component is part of the user onboarding experience, providing feedback on progress through a series of steps. It fits within a larger system that likely includes other components for user interaction and data management.

## Implementation Notes
- The progress percentage is calculated using `Math.min` to ensure it does not exceed 100%, which is crucial for maintaining visual integrity in the UI.
- The use of absolute positioning for the background track pattern and the active progress bar allows for a layered visual effect, but it requires careful management of z-index to ensure proper rendering order.
- The component is designed to be flexible and reusable, allowing for different titles and step counts based on various journeys in the application.
