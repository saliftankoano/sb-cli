---
filePath: src/utils/package-json.ts
fileVersion: unknown
lastUpdated: '2025-11-23T21:59:29.465Z'
updatedBy: sb-cli
tags:
  - src
  - utils
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
## Purpose
This file provides utility functions for locating, reading, writing, and updating a `package.json` file in a Node.js environment.

## Key Functionality
- **findPackageJson**: Searches for `package.json` starting from a specified directory and moving up the directory tree.
- **readPackageJson**: Reads and parses the `package.json` file into a JavaScript object.
- **writePackageJson**: Writes a JavaScript object back to `package.json` with proper formatting.
- **updatePostinstallScript**: Updates or creates the `postinstall` script in `package.json` to include a specific command.

## Gotchas
- The `updatePostinstallScript` function appends to the `postinstall` script without checking for command structure, which may lead to malformed commands if the existing script is not formatted correctly.
- The `findPackageJson` function may perform poorly if invoked from a deeply nested directory, as it checks each parent directory until it finds `package.json` or reaches the root.
- The code assumes that the `package.json` file is valid JSON; if it is not, the `readPackageJson` function will throw an error, which should be managed in production scenarios.

## Dependencies
- **fs/promises**: Used for file operations to leverage asynchronous behavior, which is essential in Node.js to prevent blocking the event loop.
- **path**: Provides utilities for working with file and directory paths, ensuring cross-platform compatibility.
- **file-utils.js**: A custom utility for checking file existence, abstracting away the logic to determine if a file is present.

## Architecture Context
This file serves as a utility module within a larger system that likely manages Node.js projects. It provides essential functions for handling `package.json`, which is critical for managing project dependencies and scripts.

## Implementation Notes
- The decision to use asynchronous file operations is crucial for maintaining performance in a Node.js environment.
- The `updatePostinstallScript` function's logic is designed to prevent duplicate entries for the `sb onboard` command, but it does not handle cases where the command might be formatted differently.
- Consider implementing error handling for JSON parsing and file operations to make the utility more robust in production.
