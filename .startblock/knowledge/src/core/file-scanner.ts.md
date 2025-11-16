---
filePath: src/core/file-scanner.ts
fileVersion: 7e019c662dfbf93f083367ec7fb1cde1a1698639
lastUpdated: '2025-11-15T19:00:33.360Z'
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
---
# Documentation for `src/core/file-scanner.ts`

## Purpose
This file provides functionality to filter files in a repository based on ignore patterns defined in a `.gitignore` file and additional configuration settings. It also includes a utility to determine the programming language from file extensions.

## Key Functionality
- **createIgnoreFilter(repoRoot: string)**: Asynchronously creates an ignore filter based on the contents of the `.gitignore` file located at the specified repository root. Returns an instance of the ignore filter.
  
- **filterRelevantFiles(files: string[], config: SBConfig, repoRoot: string)**: Filters an array of file paths based on ignore patterns from the `.gitignore` file and additional exclusion patterns from the provided configuration. Returns an array of relevant file paths.

- **getLanguageFromExtension(filePath: string)**: Returns the programming language associated with a given file extension. If the extension is not recognized, it returns "unknown".

## Gotchas
- **File Existence Check**: The `createIgnoreFilter` function checks for the existence of the `.gitignore` file asynchronously. If the file does not exist, the ignore filter will not have any patterns, which may lead to unintended inclusion of files.

- **Case Sensitivity**: The `getLanguageFromExtension` function uses `toLowerCase()` on the file extension, which ensures case insensitivity. However, if the mapping is extended in the future, developers must remember to maintain this case insensitivity.

- **Performance Considerations**: The filtering process in `filterRelevantFiles` involves reading the `.gitignore` file and applying multiple checks (ignore patterns and file extensions). For large repositories with many files, this could lead to performance bottlenecks. Consider caching the ignore filter if this function is called frequently.

- **Configuration Structure**: The function expects `config.analysis.excludePatterns` to be defined. If this is not set up correctly in the configuration, it may lead to runtime errors or unexpected behavior.

## Dependencies
- **ignore**: This library is used to create and manage ignore patterns, leveraging the `.gitignore` format. It simplifies the process of filtering files based on patterns, which is crucial for this module's functionality.

- **fs/promises**: Used for asynchronous file operations, allowing for non-blocking reads of the `.gitignore` file. This is important for maintaining performance in an I/O-bound context.

- **path**: Utilized for handling file paths in a cross-platform manner, ensuring that the code works correctly regardless of the operating system.

## Architecture Context
This module is part of a larger system that likely involves static analysis or code scanning within repositories. It serves as a utility to ensure that only relevant files are processed, improving efficiency and accuracy in subsequent analysis steps.

## Implementation Notes
- The decision to create an ignore filter from the `.gitignore` file reflects a common practice in development tools, ensuring that files not intended for version control (like build artifacts) are excluded from processing.

- The filtering logic in `filterRelevantFiles` is designed to be extensible; additional filtering criteria can be added easily by modifying the ignore patterns or file extension checks.

- The use of `async/await` for file operations ensures that the code remains readable and maintains a clear flow, but developers should be aware of potential unhandled promise rejections if not properly managed.

## Developer Notes

