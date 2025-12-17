---
filePath: src/core/dependency-graph.ts
fileVersion: 73caec7ca66a98f267aa4ae1de89f334c7f2c911
lastUpdated: '2025-12-17T01:36:28.382Z'
updatedBy: sb-cli
tags:
  - src
  - core
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: dependency-graph
featureRole: service
userFlows:
  - User can visualize the dependency graph of the codebase
  - User can identify hub files with many dependents
  - User can find files that share common imports for potential feature grouping
relatedFiles:
  - ../utils/file-utils.js
---
# Purpose
This file provides functionality to build and visualize a dependency graph of JavaScript/TypeScript files, helping to analyze module relationships.

## Key Functionality
- **parseImports**: Parses a file to extract its import statements.
- **resolveImportPath**: Resolves relative import paths to absolute file paths.
- **buildDependencyGraph**: Constructs a dependency graph from a list of files.
- **getDependencyContext**: Retrieves the dependencies and dependents for a specific file.
- **toDependencyGraph**: Converts the internal representation of the graph to a format suitable for visualization.
- **findHubFiles**: Identifies files that are hubs, having many dependents.
- **findFilesWithCommonImports**: Groups files that share common imports, indicating potential feature grouping.

## Gotchas
- The `findHubFiles` function's default minimum dependents threshold may not fit all projects, potentially missing important hub files in smaller codebases.
- The `findFilesWithCommonImports` function has O(n^2) complexity due to nested loops, which can lead to performance issues in larger projects.
- The `toDependencyGraph` function currently only captures import relationships, ignoring exports which may be relevant for a complete analysis.
- Error handling in `parseImports` is minimal; it returns an empty array on failure without logging, which can obscure issues during parsing.

## Dependencies
- The file relies on `@babel/parser` and `@babel/traverse` for parsing and traversing the AST of JavaScript/TypeScript files, which are essential for accurately extracting import statements.

## Architecture Context
This file is part of the core functionality for analyzing dependencies in the codebase, providing insights that can inform architectural decisions and improve module organization.

## Implementation Notes
- The design allows for easy extension; additional features like parsing exports could be added in the future.
- The use of a `Map` for the dependency graph facilitates efficient lookups and modifications, but care should be taken with memory usage in large projects.
- The functions are designed to be asynchronous, which is important for handling file I/O without blocking the event loop, but this may introduce complexity in error handling and flow control.
