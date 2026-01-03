---
filePath: ui/src/components/GuidedView.tsx
fileVersion: 0bae6537356e19ed555671925e6cf9551cd0bde6
lastUpdated: '2026-01-03T02:24:27.867Z'
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
  - User can toggle between viewing source code and knowledge documentation
  - User can expand or collapse the knowledge section for insights
relatedFiles:
  - ../hooks/useKnowledge.ts
  - ../lib/api.ts
  - ./MarkdownRenderer.tsx
---
## Purpose
The GuidedView component provides a dual-pane interface for users to view source code alongside related knowledge documentation, facilitating better understanding and exploration of code files.

## Key Functionality
- **getLanguageFromFile**: Maps file extensions to Prism language names for syntax highlighting.
- **GuidedView**: Main component that manages state for displaying either the source code or knowledge documentation, fetching file content as needed.

## Gotchas
- The component fetches the first 500 lines of code by default, which may not be suitable for very large files and can lead to performance degradation.
- The collapse state of the knowledge section resets whenever the defaultCollapsed prop or the state.file changes, which could lead to unexpected behavior for users.
- The button for toggling the knowledge section visibility is hidden on smaller screens, which might limit accessibility for users on mobile devices.

## Dependencies
- **framer-motion**: Used for animations, enhancing user experience but may require performance considerations if overused.
- **MarkdownRenderer**: Renders markdown content for knowledge documentation, ensuring that the documentation is displayed correctly and is user-friendly.

## Architecture Context
This component is part of a larger knowledge management system that integrates code exploration with contextual insights, allowing users to learn from code directly and understand its implications through documentation.

## Implementation Notes
- The component utilizes React hooks for state management and side effects, ensuring a responsive UI.
- The decision to fetch a fixed number of lines (500) was made for simplicity but could be revisited for scalability.
- The removal of the Set for managing expanded sections simplifies the state but may require future enhancements if more sections are added.
