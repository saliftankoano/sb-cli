---
filePath: src/commands/init.ts
fileVersion: bca7a57c90c5a2434483050c74be521fbca67f30
lastUpdated: '2025-11-16T21:50:03.663Z'
updatedBy: sb-cli
tags:
  - src
  - commands
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
# Documentation for `src/commands/init.ts`

## Purpose
This file initializes the Startblock tool in a local repository by creating necessary directories, configuration files, and setting up Git hooks for automated analysis of code changes.

## Key Functionality
- **`initCommand()`**: The main function that orchestrates the initialization process, including creating directories, prompting for user input, generating configuration files, and setting up Husky hooks.
- **`promptUser(question: string)`**: Prompts the user for input, ensuring that any whitespace or newlines are trimmed from the response.
- **`generateConfig(apiKey: string)`**: Generates a JSON configuration string with the provided OpenAI API key.

## Gotchas
- **API Key Validation**: The API key must start with "sk-". If it doesn't, the user is informed, and a template config file is created without the key. This can lead to confusion if users expect the initialization to succeed without a valid key.
- **Husky Setup**: If the `package.json` file is missing, the Husky setup will be skipped, which may lead to users thinking the tool is fully functional when it isn't. Ensure that the command is run in a Node.js project.
- **File Permissions**: The script sets executable permissions on the Husky hook file. If the environment does not support this (e.g., Windows without WSL), the hook may not execute as intended.
- **Error Handling**: Errors during the initialization process are caught and logged, but the script exits with a non-zero status code, which may not be expected behavior for all users.

## Dependencies
- **`chalk`**: Used for colored console output to enhance user experience and provide clear feedback during the initialization process.
- **`fs/promises`**: Utilized for file system operations with promises, allowing for cleaner asynchronous code.
- **`child_process`**: Used to execute shell commands for installing and initializing Husky, which is crucial for setting up Git hooks.
- **`nanospinner`**: Provides a simple and effective way to show loading spinners, improving user interaction during long-running tasks.

## Architecture Context
This file is part of a command-line interface (CLI) for the Startblock tool, which integrates with Git to automate knowledge capture from code changes. It works in conjunction with other utility modules for file management and user interaction, forming a cohesive setup process for developers.

## Implementation Notes
- **Configuration Management**: The configuration file is generated based on user input, and a template is provided for team sharing. This approach ensures that sensitive information (like the API key) is not committed to version control.
- **User Experience**: The use of spinners and colored messages enhances the user experience by providing feedback on the progress of the initialization steps.
- **Performance Considerations**: The script performs file system operations and shell commands sequentially, which may introduce delays. However, the use of asynchronous functions helps mitigate blocking the main thread.
- **Common Mistakes to Avoid**: Ensure that the command is run in a valid Node.js project with a `package.json` file present to avoid skipping Husky setup. Also, remind users to validate their API key format to prevent issues during configuration.
