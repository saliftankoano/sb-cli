---
filePath: ui/src/hooks/useProgress.ts
fileVersion: unknown
lastUpdated: '2025-12-17T01:38:41.912Z'
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
feature: onboarding-progress
featureRole: helper
userFlows:
  - User can track their onboarding progress
  - User can mark documents as viewed
  - User can mark features as explored
  - User can complete onboarding steps
  - User can reset their onboarding progress
relatedFiles: []
---
# Purpose
This file provides a custom React hook to track and manage onboarding progress for users, persisting the data in localStorage.

# Key Functionality
- `useProgress`: Main hook that manages onboarding progress, including state initialization, updates, and persistence.
- `markDocViewed`: Marks a document as viewed, updating the state accordingly.
- `markFeatureExplored`: Marks a feature as explored, updating the state accordingly.
- `markStepCompleted`: Marks a step as completed, ensuring no duplicate updates.
- `resetProgress`: Resets the progress state to default and clears localStorage.
- `progressPercentage`: Computes the percentage of completed steps based on total steps.

# Gotchas
- If localStorage is unavailable (e.g., during server-side rendering), the hook defaults to a static state, which might not reflect the actual user progress.
- The `markDocViewed` and `markFeatureExplored` functions prevent duplicates, but if the logic changes, it could lead to incorrect progress tracking.
- The `progressPercentage` calculation assumes `totalSteps` is always greater than zero, which could lead to unexpected results if modified.

# Dependencies
- `useState`, `useEffect`, and `useCallback` from React are used to manage state and side effects efficiently, ensuring that updates are batched and performance is optimized.

# Architecture Context
This hook is part of the onboarding feature, allowing users to track their progress through various steps and documentation. It integrates with the UI components that display onboarding status and guides users through the onboarding process.

# Implementation Notes
- The decision to use localStorage for persistence allows progress to be retained across sessions, enhancing user experience.
- Error handling during localStorage operations is crucial to avoid crashes and provide feedback in case of failures.
- The hardcoded `totalSteps` value could be refactored to allow for dynamic step counts in future iterations, improving flexibility.
