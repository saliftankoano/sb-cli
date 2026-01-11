---
filePath: ui/src/components/StepNavigator.tsx
fileVersion: 9674f2f871b9b2558c7acd2b813bcfa34f2cea42
lastUpdated: '2026-01-11T23:19:32.845Z'
updatedBy: sb-cli
tags:
  - ui
  - src
  - components
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: step-navigator
featureRole: component
userFlows:
  - User can navigate to the previous step in a multi-step process
  - User can navigate to the next step in a multi-step process
  - User can use keyboard shortcuts to navigate steps
relatedFiles:
  - '@phosphor-icons/react'
---
## Purpose
The `StepNavigator` component provides a user interface for navigating between steps in a multi-step process, allowing users to move forward or backward through the steps easily.

## Problem
Before the `StepNavigator` existed, users faced challenges in navigating through multi-step forms or processes, often leading to confusion and frustration. There was no consistent way to move between steps, and users had to rely on manual input or unclear visual cues, which hindered the overall user experience.

## Solution
The `StepNavigator` solves this problem by providing clearly labeled buttons for previous and next steps, along with visual feedback based on the user's ability to navigate (enabled/disabled states). It also implements keyboard shortcuts for arrow key navigation, enhancing accessibility. The component is designed to be responsive, ensuring usability across different devices and screen sizes.

## Impact
With the `StepNavigator`, users can seamlessly navigate through multi-step processes, improving their experience and reducing the likelihood of errors. Developers can easily integrate this component into forms, ensuring a consistent navigation experience across the application. This enhances overall user satisfaction and engagement with the application.

## Architecture Context
The `StepNavigator` fits into the larger system as a reusable component that can be integrated into various multi-step forms or workflows. It relies on props for its functionality, allowing it to be flexible and adaptable to different contexts. The component listens for keyboard events to facilitate navigation, making it a key part of the user interaction layer.

## Gotchas (If Applicable)
- Ensure that the `onNext` and `onPrev` functions are correctly implemented to handle navigation logic; otherwise, the buttons may not function as expected.
- Be mindful of the focus state when using keyboard navigation, as it may interfere with text input fields if not handled properly.
