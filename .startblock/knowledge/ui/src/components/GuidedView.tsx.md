---
filePath: ui/src/components/GuidedView.tsx
fileVersion: 9674f2f871b9b2558c7acd2b813bcfa34f2cea42
lastUpdated: '2026-01-11T23:19:32.842Z'
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
feature: guided-view
featureRole: component
userFlows:
  - User can toggle between viewing source code and knowledge insights
  - User can expand or collapse the insights pane for better navigation
  - User can view highlighted lines in the code for focused learning
relatedFiles:
  - '@/hooks/useKnowledge'
  - '@/lib/api'
  - ./MarkdownRenderer
---
## Purpose
This file provides a guided view component that allows users to explore source code alongside contextual knowledge insights.

## Problem
Before this file existed, users had difficulty understanding the context and purpose of specific code segments, leading to confusion and inefficiencies during code reviews or learning sessions. There was no integrated way to view both the source code and related documentation or insights, which hindered the learning process for new developers and made it challenging to maintain code quality.

## Solution
The GuidedView component solves this problem by implementing a dual-pane layout that allows users to switch between viewing the source code and associated knowledge insights. It fetches code dynamically based on user actions and highlights specific lines for better visibility. The component also manages state for loading and collapsing sections, ensuring a responsive and interactive user experience.

## Impact
With this file, users can now easily toggle between source code and knowledge insights, enhancing their understanding of the codebase. This feature supports better onboarding for new developers and facilitates more effective code reviews, ultimately improving team productivity and code quality.

## Architecture Context
The GuidedView component is part of the UI layer, integrating with hooks for knowledge retrieval and API calls for fetching file content. It relies on state management for user interactions and employs libraries like `framer-motion` for animations, ensuring a smooth user experience. The component interacts with knowledge data to provide contextual insights, enhancing the overall functionality of the application.

## Gotchas (If Applicable)
- Ensure that the file paths used for fetching knowledge insights are correct to avoid missing data.
- The component's performance may be impacted by the size of the code being fetched; consider optimizing the fetch logic for larger files.
