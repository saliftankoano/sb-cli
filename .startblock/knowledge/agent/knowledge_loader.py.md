---
filePath: agent/knowledge_loader.py
fileVersion: 58f84348b1e49d79670af734ad811a0504f9e922
lastUpdated: '2025-12-17T01:33:56.187Z'
updatedBy: sb-cli
tags:
  - agent
  - python
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: knowledge-loader
featureRole: service
userFlows:
  - User can access onboarding documents
  - User can view a summary of system features
  - User can retrieve detailed knowledge about specific files
relatedFiles:
  - frontmatter.py
---
# Knowledge Loader Documentation

## Purpose
This file is responsible for loading and formatting knowledge files and onboarding documents for an agent's context, enabling better user interaction.

## Key Functionality
- `load_features(repo_root: str)`: Loads system features from `features.json`.
- `load_onboarding_doc(repo_root: str, doc_name: str)`: Loads specific onboarding documents like `INDEX.md` or `SETUP.md`.
- `get_onboarding_context(repo_root: str)`: Aggregates multiple onboarding documents into a single dictionary.
- `format_features_summary(features: List[Dict])`: Formats a summary of features for display.
- `load_session(repo_root: str)`: Loads the most recent onboarding session data.
- `load_knowledge_file(knowledge_dir: Path, file_path: str)`: Loads and parses a knowledge file, extracting sections based on headers.

## Gotchas
- The fallback mechanism for the 'frontmatter' library is crucial; if it's not available, the code manually parses frontmatter, which may lead to inconsistencies if the format is not adhered to.
- Error handling is implemented throughout, but it primarily logs errors without halting execution, which could lead to silent failures if not monitored.
- The session loading mechanism sorts session files by modification time, which assumes that the most recent session is always the most relevant, potentially overlooking other important sessions.
- The method for extracting sections from markdown content relies on regex, which may fail if the markdown structure is not strictly followed, leading to missing information.

## Dependencies
- The `frontmatter` library is used for parsing markdown files with frontmatter; if unavailable, a manual parsing method is implemented as a fallback.

## Architecture Context
This file fits into the larger system by providing the necessary context and documentation for the agent, allowing it to interact intelligently based on the loaded knowledge and onboarding materials.

## Implementation Notes
- The file uses a structured approach to load and format various documents, ensuring that the agent has access to relevant information.
- Performance considerations include the sorting of session files, which could impact loading times if there are many sessions. The regex used for section extraction should be tested against various markdown formats to ensure robustness.
