---
filePath: src/git/operations.ts
fileVersion: e5f9c30aed9595efa90635f860dee8cb39a86e4d
lastUpdated: '2025-11-16T21:33:52.204Z'
updatedBy: sb-cli
tags:
  - src
  - git
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
# Git Operations Documentation

## Purpose
This file provides a wrapper around Git operations using the `simple-git` library, enabling asynchronous interactions with a Git repository. It allows for operations such as retrieving staged files, commit messages, and file diffs.

## Key Functionality
- **getStagedFiles**: Returns a list of files that are currently staged for commit.
- **getFileHash**: Retrieves the latest commit hash for a specified file.
- **getFileDiff**: Obtains the diff for a staged file.
- **addFiles**: Stages specified files for commit.
- **getLastCommitMessage**: Fetches the message of the last commit.
- **getCurrentCommitMessage**: Retrieves the current commit message, with an option to specify a custom message file path.

## Gotchas
- **Fallback Logic**: The `getCurrentCommitMessage` method falls back to the last commit message if the current message is empty or if reading the message file fails. This behavior might lead to confusion if users expect an error when the message is not available.
- **Path Handling**: The method accepts an optional `msgFilePath`. If a relative path is provided, it is resolved against the repository path. Users must ensure the path is correct to avoid unexpected results.
- **Error Handling**: Many methods catch errors silently and return default values. This can mask issues during development. Consider logging errors for better debugging.

## Dependencies
- **simple-git**: This library simplifies Git operations in Node.js, providing a promise-based interface that is easy to use for asynchronous operations.
- **fs/promises**: Used for file system operations, allowing for reading files asynchronously. This is crucial for handling commit messages without blocking the event loop.

## Architecture Context
This module fits into a larger system that likely involves version control operations within a development environment. It abstracts Git interactions, making it easier for other components to perform Git-related tasks without dealing directly with command-line intricacies.

## Implementation Notes
- **Performance Considerations**: The use of asynchronous methods ensures that file I/O and Git operations do not block the main thread, which is essential for maintaining application responsiveness.
- **Message Validation**: The `getCurrentCommitMessage` method includes validation to ensure that the retrieved message is not just whitespace. This prevents empty commit messages, which can lead to confusion in version history.
- **Default Values**: The use of sensible defaults (like the `.git/COMMIT_EDITMSG` path) helps streamline operations, but developers should be aware of this behavior when customizing paths.

## Developer Insights

Changed the approach for the current commit instead of using the pre-commit now we use the commit-msg from husky to get the current commit message reliably. This had a domino effect on a couple files from operation to analyzer. Then we ran into the issue of permissions when using the sb cli so we added a postbuild script to make the index.js execuatable after each build.

*Captured during commit: fix getCurrentCommit & update readme*
