---
filePath: ui/src/components/FeatureFlow.tsx
fileVersion: e79e872063ecc7ae9518cd8ed987b60af3b96e2f
lastUpdated: '2025-12-17T01:38:41.906Z'
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
feature: feature-flow
featureRole: component
userFlows:
  - User can visualize user flows and associated files
  - User can collapse or expand nodes to manage visibility of information
  - User can interact with nodes to see detailed file information
relatedFiles:
  - ../lib/api
---
## Purpose
This file implements a React component that visualizes user flows and their associated files in an interactive graph format.

## Key Functionality
- `FeatureFlow`: Main component that renders the graph and manages state for collapsed nodes and selected nodes.
- `GlowingNode`: Custom node component that represents a user flow with a glowing effect.
- `FileNode`: Custom node component that represents individual files associated with a user flow.
- `truncate`: Helper function to create readable labels by truncating long text.

## Gotchas
- The component uses a Set to manage collapsed node IDs, which can lead to unexpected behavior if the state is not properly updated, especially during rapid user interactions.
- The graph layout may not handle very large datasets efficiently, potentially causing performance issues or lag during rendering.
- Ensure that the `feature` prop contains valid data; otherwise, the component will render a message indicating no flow data is available.

## Dependencies
- `reactflow`: Used for rendering the interactive graph and handling node connections.
- `framer-motion`: Provides animations for node appearance and transitions, enhancing the visual experience.

## Architecture Context
This component is part of a larger feature that visualizes complex user interactions and workflows, allowing users to understand the relationships between different actions and files in the system.

## Implementation Notes
- The layout algorithm calculates positions for nodes based on the number of flows and files, with specific constants for spacing and wrapping to ensure a clean visual presentation.
- The component handles user interactions such as clicking on nodes to toggle visibility of associated files, which is crucial for user engagement and usability.
