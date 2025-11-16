---
filePath: src/core/dependency-graph.ts
fileVersion: 7e019c662dfbf93f083367ec7fb1cde1a1698639
lastUpdated: '2025-11-15T19:00:33.359Z'
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
# Documentation for `src/core/dependency-graph.ts`

## Purpose
This file provides functionality to parse JavaScript/TypeScript files for their import dependencies, build a dependency graph, and retrieve contextual information about dependencies and dependents.

## Key Functionality
- **`parseImports(filePath: string): Promise<string[]>`**: Asynchronously parses a file to extract its import statements, returning an array of import paths. Handles both ES6 `import` statements and CommonJS `require()` calls.
  
- **`resolveImportPath(importStr: string, fromFile: string, repoRoot: string): string | null`**: Resolves a relative import path to an absolute file path based on the current file's location and the repository root. Skips external packages in `node_modules`.

- **`buildDependencyGraph(files: string[], repoRoot: string): Promise<Map<string, FileNode>>`**: Constructs a dependency graph from a list of files, mapping each file to its imports and the files that import it.

- **`getDependencyContext(filePath: string, graph: Map<string, FileNode>): DependencyContext`**: Retrieves the dependency context for a specified file, including its direct dependencies and dependents.

## Gotchas
- **Error Handling in `parseImports`**: If parsing fails (e.g., due to syntax errors), the function returns an empty array instead of throwing an error. This may lead to silent failures where a file is assumed to have no imports when it actually does.

- **Import Path Resolution**: The `resolveImportPath` function only returns paths for local imports (starting with `.` or `/`). It will return `null` for external packages, which might lead to unexpected behavior if the caller assumes all imports will be resolved.

- **Common Mistake with Extensions**: The loop in `resolveImportPath` attempts to append extensions but does not actually check if the resolved path exists. This could lead to incorrect assumptions about the availability of the file.

- **Dependency Graph Initialization**: The graph is initialized for all files, but if a file has no imports, it will still be present in the graph with empty arrays. This could lead to confusion if users expect only files with dependencies to be included.

## Dependencies
- **`@babel/parser`**: Used for parsing JavaScript/TypeScript code into an Abstract Syntax Tree (AST), enabling the extraction of import statements.
  
- **`@babel/traverse`**: Facilitates traversing the AST to find specific nodes (like import declarations), making it easier to collect import paths.

- **`path`**: A Node.js module used for handling and transforming file paths, crucial for resolving import paths relative to the file structure.

- **`readFileSafe`**: A utility function that safely reads file content, ensuring that the application can handle file read errors gracefully.

## Architecture Context
This module is part of a larger system that likely involves static analysis or tooling for JavaScript/TypeScript projects. The dependency graph it builds can be used for various purposes, such as code analysis, visualization, or optimization tasks.

## Implementation Notes
- **Performance Considerations**: The `buildDependencyGraph` function processes files sequentially, which may lead to performance bottlenecks for large projects. Consider parallelizing the parsing of files if performance becomes an issue.

- **Future Enhancements**: The `getDependencyContext` function currently does not parse exports. Future implementations could enhance this by analyzing the AST to extract exported members, providing richer context for dependencies.

- **Error Recovery in Parsing**: The `errorRecovery` option in the parser configuration allows for more robust handling of malformed files, but it may also lead to unexpected results if the file structure is significantly broken. Ensure that users are aware of this behavior.

## Developer Notes

