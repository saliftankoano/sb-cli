---
filePath: ui/src/components/ContentHeader.tsx
fileVersion: e79e872063ecc7ae9518cd8ed987b60af3b96e2f
lastUpdated: '2025-12-17T01:38:41.905Z'
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
feature: onboarding
featureRole: component
userFlows:
  - User can view onboarding progress
  - User can toggle the sidebar for navigation
  - User can reset onboarding progress
relatedFiles:
  - hooks/useSession.ts
  - hooks/useProgress.ts
---
# Purpose
This file defines the `ContentHeader` component, which displays user-specific onboarding information and progress while allowing for sidebar toggling.

## Key Functionality
- `ContentHeader`: Main component that renders user onboarding details, a progress bar, and a sidebar toggle button.

## Gotchas
- The component does not handle cases where `session` might be partially populated; ensure that the session is fully established before rendering.
- If `onToggleSidebar` is not provided, the sidebar toggle button will not render, which may lead to confusion if users expect it to be present.

## Dependencies
- `useSession`: Used to retrieve the current user's session, ensuring that the component only renders for authenticated users.
- `useProgress`: Manages the onboarding progress state, which is critical for displaying the progress bar correctly.
- `@phosphor-icons/react`: Provides icons for UI elements, enhancing visual feedback for user actions.

## Architecture Context
This component is part of the onboarding feature, which aims to guide users through initial setup steps. It integrates with session management and progress tracking to provide a seamless user experience.

## Implementation Notes
- The component uses conditional rendering to manage UI states effectively, ensuring that it only displays relevant information based on the user's session.
- The progress bar's width is dynamically set based on the `progressPercentage`, which should be calculated accurately in the `useProgress` hook to reflect true progress.
- The design follows a responsive layout, but developers should test across different screen sizes to ensure usability remains consistent.
