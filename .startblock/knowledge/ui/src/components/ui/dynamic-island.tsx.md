---
filePath: ui/src/components/ui/dynamic-island.tsx
fileVersion: e79e872063ecc7ae9518cd8ed987b60af3b96e2f
lastUpdated: '2026-01-03T02:24:27.875Z'
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
feature: dynamic-island
featureRole: component
userFlows:
  - User can interact with a dynamic UI element that responds to size changes
  - User can view content that adapts based on screen size and device type
relatedFiles:
  - motion/react
---
## Purpose
This file defines a dynamic island UI component that adjusts its size and animations based on user interactions and screen size.

## Key Functionality
- `DynamicIslandProvider`: Provides context for managing the size and animation state of the dynamic island.
- `useDynamicIslandSize`: Custom hook to access the dynamic island's size context.
- `DynamicIsland`: Main component that renders the dynamic island based on the current size and screen size.
- `DynamicIslandContent`: Renders the content of the dynamic island with appropriate animations.
- `calculateDimensions`: Utility function to compute the width and height based on size presets and screen size.

## Gotchas
- The animation queue can lead to unexpected behavior if multiple animations are scheduled at once; ensure to manage the queue carefully.
- If the `DynamicIsland` is used outside of the `DynamicIslandProvider`, it will throw an error, as it relies on context.
- Screen size detection is based on window width, which may not account for all devices or orientations, potentially leading to layout issues.

## Dependencies
- `motion/react`: Used for animations, providing a smooth user experience with spring physics.
- React hooks (`useReducer`, `useContext`, etc.) are used for state management, allowing for a clean separation of concerns and easier testing.

## Architecture Context
This component fits into a larger UI framework where dynamic, responsive components are needed to enhance user interaction. It allows for a more engaging experience by adapting to user actions and screen sizes.

## Implementation Notes
- The choice of using a context provider for state management simplifies the component tree and allows for easy access to the dynamic island's state.
- The animation logic is encapsulated within the provider, ensuring that animations are handled uniformly across all instances of the dynamic island.
- Careful consideration of size presets is essential to avoid layout issues on different devices, particularly mobile.
- The use of `useWillChange` helps optimize performance by informing the browser of upcoming changes, which can improve rendering efficiency.
