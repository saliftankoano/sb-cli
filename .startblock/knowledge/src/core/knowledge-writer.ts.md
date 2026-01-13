---
filePath: src/core/knowledge-writer.ts
fileVersion: f3d1f19051849c62abadd3659f559b94ffab6c94
lastUpdated: '2026-01-13T10:49:43.468Z'
updatedBy: sb-cli
tags:
  - src
  - core
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: knowledge-management
featureRole: service
userFlows:
  - >-
    User can document code knowledge including design rationale and failed
    approaches
  - User can retrieve existing knowledge documentation for reference
relatedFiles:
  - ../utils/file-utils.js
  - ./openai-client.js
---
## Purpose
This file manages the creation and retrieval of knowledge documentation for source code, ensuring that critical insights and metadata are captured and stored in a structured format.

## Problem
Before this file existed, there was no standardized way to document the rationale behind code decisions and the challenges faced during development. This lack of documentation often led to confusion for future developers and hindered the onboarding process. The need for a clear, organized method to capture and share knowledge became apparent as the codebase grew.

## Solution
The `knowledge-writer.ts` file provides functions to write and read knowledge documentation, utilizing a structured metadata format. It generates knowledge file paths that mirror the source file structure, ensuring easy navigation. The recent addition of the `attemptsAndFailures` field allows developers to document what approaches were tried and did not succeed, enriching the knowledge base and providing context for future decisions.

## Impact
With this file, developers can now create and maintain comprehensive documentation that includes not only successful approaches but also insights into failed attempts. This fosters a culture of learning and transparency, enabling teams to avoid repeating mistakes and to build upon past experiences. The structured format also aids in the onboarding of new developers by providing them with clear insights into the codebase's history and rationale.

## Architecture Context
This file is part of the core utilities for knowledge management within the application. It interacts with the file system to create and read markdown files, leveraging utility functions for file operations. The knowledge files are stored in a directory structure that reflects the source code, making it intuitive to find related documentation.

## Gotchas (If Applicable)
- Ensure that the directory structure is correctly mirrored; otherwise, knowledge files may not be found.
- Be cautious when updating existing knowledge files, as incorrect handling of the metadata could lead to loss of important information. Incremental updates are supported, but existing data must be read and merged correctly to avoid overwriting valuable insights.
