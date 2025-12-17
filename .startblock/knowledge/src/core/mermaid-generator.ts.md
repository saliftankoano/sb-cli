---
filePath: src/core/mermaid-generator.ts
fileVersion: 3b416f26343e9cc1cfd6140ef640501273e1831e
lastUpdated: '2025-12-17T01:36:28.384Z'
updatedBy: sb-cli
tags:
  - src
  - core
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: mermaid-generator
featureRole: helper
userFlows:
  - User can visualize user flows through features
  - User can see high-level architecture of features
  - User can understand file interactions based on user actions
relatedFiles:
  - ./features.js
  - ./dependency-graph.js
---
## Purpose
Generates Mermaid diagrams to visualize user flows, feature relationships, and architecture, aiding in documentation and understanding of the system.

## Key Functionality
- `generateMermaidFromUserFlows`: Creates a flowchart diagram from user flows, connecting actions in a top-down format.
- `generateMermaidJourney`: Generates a high-level journey diagram representing user actions through a feature.
- `generateMermaidSequence`: Produces a sequence diagram mapping user actions to file interactions, highlighting dependencies.
- `generateArchitectureMermaid`: Creates an architecture diagram showing feature relationships, optionally grouped by categories.
- `generateConnectedArchitecture`: Generates a diagram based on a dependency graph, illustrating real connections between features.

## Gotchas
- If `userFlows` is empty or undefined, functions return an empty string, which is intended behavior but may lead to confusion if not documented.
- Feature names and flow labels are cleaned to prevent invalid characters in Mermaid syntax, which may truncate names longer than specified limits, potentially losing important context.
- The sequence diagram limits the number of participants to 8 for readability; exceeding this may lead to omitted important files in the diagram.

## Dependencies
- Imports `Feature` from `./features.js` to define the structure of features used in architecture diagrams.
- Imports `FileNode` from `./dependency-graph.js` to represent file dependencies in the connected architecture diagram.

## Architecture Context
This file acts as a utility for generating visual representations of user flows and feature interactions, which are essential for understanding the system's architecture and user experience. It integrates with features and dependency graphs to provide comprehensive documentation.

## Implementation Notes
- The cleaning of feature names and flow labels ensures compatibility with Mermaid syntax but may require careful consideration to avoid losing context in diagrams.
- Future enhancements could include AI-based grouping of user flows, which would improve the organization of generated diagrams and make them more informative.
