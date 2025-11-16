---
filePath: src/git/operations.ts
fileVersion: 12dc6d2e377d61939e2cf493b9f741e44fc70d3b
lastUpdated: '2025-11-16T04:14:46.856Z'
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
This file provides a wrapper around Git operations using the `simple-git` library, enabling asynchronous interactions with a Git repository. It facilitates common tasks such as retrieving staged files, commit messages, and file diffs.

## Key Functionality
- **getStagedFiles**: Returns a list of files that are currently staged for commit.
- **getFileHash**: Retrieves the latest Git hash for a specified file.
- **getFileDiff**: Obtains the diff for a staged file.
- **addFiles**: Stages specified files for commit.
- **getLastCommitMessage**: Fetches the message of the last commit.
- **getCurrentCommitMessage**: Reads the current commit message from the `.git/COMMIT_EDITMSG` file, filtering out comments.

## Gotchas
- **Current vs. Last Commit Message**: The `getLastCommitMessage` method retrieves the message of the previous commit, not the one currently being written. This can lead to confusion if users expect it to reflect the current commit.
- **Error Handling**: Many methods return `null` or fallback values in case of errors. It's crucial to handle these cases in the calling code to avoid unexpected behaviors.
- **File Path Handling**: The `getCurrentCommitMessage` method relies on the existence of the `.git/COMMIT_EDITMSG` file. If the file is missing or inaccessible, it defaults to the last commit message, which may not be the expected behavior.

## Dependencies
- **simple-git**: This library simplifies Git operations in Node.js, providing a promise-based API that enhances readability and maintainability.
- **path**: Used for constructing file paths in a cross-platform manner, ensuring compatibility across different operating systems.
- **fs/promises**: Utilized for asynchronous file operations, allowing non-blocking reads of the commit message file.

## Architecture Context
This module is part of a larger system that interacts with Git repositories, likely as part of a version control tool or CI/CD pipeline. It abstracts Git operations to simplify usage across the application, promoting code reuse and reducing complexity in other parts of the system.

## Implementation Notes
- **Asynchronous Operations**: All methods are asynchronous, leveraging promises to handle operations that may take time, such as file I/O and Git commands.
- **Performance Considerations**: The use of `simple-git` is generally efficient for most operations, but care should be taken with methods that may invoke multiple Git commands, as they can introduce latency. For example, `getStagedFiles` executes a diff command which may be slower for large repositories.
- **Common Mistakes**: Developers should ensure that the repository path provided to `createGitOperations` is valid. Using an incorrect path may lead to errors or unexpected behaviors when performing Git operations.

## Developer Insights

Fixed my mistake of using get last commit message on git instead of using the one the user would currently want to submit. I added a new function to get the current in the ops.ts & updated the analyzer to show files properly. Late night coding mistake 😅.

*Captured during commit: migrate knowledge docs into directory style & update knowlege-writer for new knowlege organization*
