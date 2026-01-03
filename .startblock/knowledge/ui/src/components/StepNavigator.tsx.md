---
filePath: ui/src/components/StepNavigator.tsx
fileVersion: unknown
lastUpdated: '2026-01-03T02:24:27.872Z'
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
feature: step-navigator
featureRole: component
userFlows:
  - User can navigate to the next step in a process
  - User can navigate to the previous step in a process
  - User can use keyboard shortcuts to navigate between steps
relatedFiles:
  - '@phosphor-icons/react'
---
## Purpose
The StepNavigator component provides a user interface for navigating between steps in a multi-step process, including keyboard navigation support.

## Key Functionality
- **StepNavigator**: A React component that renders previous and next buttons, allowing users to navigate through steps. It supports keyboard shortcuts for navigation and displays dynamic titles based on props.

## Gotchas
- Keyboard shortcuts will not work if the user is focused on an input or textarea, which may lead to confusion if users expect to navigate using the keyboard in those contexts.
- The Next button can be disabled if both `canGoNext` is false and `isCompleted` is false, which could lead to a situation where users are unsure why they cannot proceed.
- Ensure that the `onNext` and `onPrev` functions are properly defined and passed as props, as failing to do so will lead to runtime errors when buttons are clicked.

## Dependencies
- The component uses icons from `@phosphor-icons/react` for visual representation of navigation actions, which enhances the user interface but requires that the library is included in the project.

## Architecture Context
The StepNavigator fits into a larger multi-step process UI, serving as a critical component for user navigation. It allows for a seamless transition between steps, which is essential for user engagement in forms or wizards.

## Implementation Notes
- The component uses `useEffect` to manage keyboard event listeners, which is a common pattern in React for handling side effects. This ensures that listeners are cleaned up properly to avoid memory leaks.
- The styling of buttons is conditionally applied based on the state of `canGoNext` and `canGoPrev`, which is a good practice for maintaining a responsive UI that reflects the current state of the application. 
- Consider performance implications when using dynamic props, as frequent re-renders can occur if the parent component updates state often. It's advisable to memoize functions passed as props if they are defined inline.
