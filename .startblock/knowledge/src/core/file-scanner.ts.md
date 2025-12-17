---
filePath: src/core/file-scanner.ts
fileVersion: ad2ece243cabb19aa268bce51ac6e7a2a559591b
lastUpdated: '2025-12-17T01:36:28.383Z'
updatedBy: sb-cli
tags:
  - src
  - core
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: file-scanning
featureRole: service
userFlows:
  - User can filter files based on configuration and ignore patterns
  - User can ensure only relevant files are processed for analysis
relatedFiles:
  - ../utils/file-utils.js
  - ../config/defaults.js
---
## Purpose
This file provides functionality to filter files based on configuration and ignore patterns, primarily for use in a file scanning context.

## Key Functionality
- `createIgnoreFilter(repoRoot: string)`: Creates an ignore filter based on the contents of the `.gitignore` file located in the specified repository root.
- `filterRelevantFiles(files: string[], config: SBConfig, repoRoot: string, options: { skipExistenceCheck?: boolean } = {})`: Filters the provided list of files based on ignore patterns and file extensions defined in the configuration. It also checks for file existence unless bypassed.
- `getLanguageFromExtension(filePath: string)`: Returns the programming language associated with a given file extension.

## Gotchas
- The `skipExistenceCheck` option can lead to silent failures if not handled properly, as non-existent files will not trigger warnings.
- A malformed `.gitignore` may cause unexpected filtering results, potentially excluding valid files from processing.
- Performance can degrade with a large number of files due to multiple asynchronous calls to `fileExists`, especially if existence checks are not skipped.

## Dependencies
- `ignore`: Used to create a filter based on `.gitignore`, allowing for flexible file exclusion.
- `fs/promises`: Provides promise-based file system operations, enabling asynchronous file checks and reads.
- `path`: Used for handling and resolving file paths in a platform-independent manner.
- `fileExists` and `matchesExtensions`: Custom utility functions that encapsulate file existence checks and extension matching logic, promoting code reuse and separation of concerns.

## Architecture Context
This file is part of the core functionality for file scanning within the application, enabling the system to intelligently filter files based on user-defined configurations and existing project structures. It interacts with configuration files and the file system to ensure relevant files are processed.

## Implementation Notes
- The addition of `skipExistenceCheck` was made to improve performance in scenarios where file existence is guaranteed, but developers must be cautious about its implications.
- The use of asynchronous functions is critical for maintaining responsiveness, but it requires careful handling of promises to avoid performance bottlenecks.
- The filtering logic is designed to be extensible, allowing for easy updates to ignore patterns and file type configurations as project requirements evolve.
