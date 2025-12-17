---
filePath: agent/commands.py
fileVersion: 58f84348b1e49d79670af734ad811a0504f9e922
lastUpdated: '2025-12-17T01:33:56.184Z'
updatedBy: sb-cli
tags:
  - agent
  - python
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: agent-commands
featureRole: helper
userFlows:
  - User can navigate between files or steps
  - User can view connections between files
  - User can expand sections in the UI
  - User can highlight specific lines of code
  - User can open the file tree sidebar
  - User can view a file with contextual information and code snippets
relatedFiles: []
---
## Purpose
This file defines UI command structures for agent-to-frontend communication, enabling various user interactions within the application.

## Key Functionality
- `NavigateCommand`: Command to navigate to a different file or step.
- `ShowConnectionsCommand`: Command to display connections between files.
- `ExpandSectionCommand`: Command to expand specific sections in the UI.
- `HighlightCodeCommand`: Command to highlight lines of code in a file.
- `OpenSidebarCommand`: Command to open the file tree sidebar.
- `ShowFileCommand`: Main command for displaying a file with context and optional code excerpts.
- `serialize_command`: Function to serialize commands into JSON bytes for transmission.

## Gotchas
- Ensure that the `startLine`, `endLine`, and `highlightLines` attributes in `ShowFileCommand` are validated before use, as incorrect values could lead to displaying unintended code sections.
- The `UICommand` union type must be kept updated if new command types are added; otherwise, type checking may fail.
- Be cautious with mutable default arguments in dataclasses; use `field(default_factory=list)` for lists to avoid shared mutable state.

## Dependencies
- `dataclass`: Used for clean and maintainable command definitions, reducing boilerplate code.
- `json`: Used for serializing commands into a format suitable for data transmission, ensuring compatibility with frontend requirements.

## Architecture Context
This file serves as a communication layer between the agent and the frontend, defining how user actions are represented as commands. It is integral for enabling dynamic UI interactions based on agent inputs.

## Implementation Notes
- The choice of using `Literal` for command types enhances type safety but may require updates to the codebase when new command types are introduced.
- The serialization method assumes that all command attributes are JSON-serializable, which should be validated during development to prevent runtime errors.
