---
filePath: src/commands/init.ts
fileVersion: 7e019c662dfbf93f083367ec7fb1cde1a1698639
lastUpdated: '2025-11-15T19:00:33.358Z'
updatedBy: sb-cli
tags:
  - src
  - commands
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
---
# Documentation for `src/commands/init.ts`

## Purpose
This file initializes the Startblock tool in a repository by creating necessary directories, prompting for an OpenAI API key, generating configuration files, and setting up Husky for pre-commit hooks.

## Key Functionality
- **`initCommand()`**: The main function that orchestrates the initialization process, including directory creation, API key handling, configuration file generation, and Husky setup.
- **`promptUser(question: string): Promise<string>`**: Prompts the user for input and cleans the response to remove extra whitespace, ensuring that long API keys can be handled properly.
- **`generateConfig(apiKey: string): string`**: Generates a configuration JSON string by inserting the provided API key into a predefined template.

## Gotchas
- **API Key Format**: The function checks if the API key starts with "sk-". If not, it skips saving the key and creates a template instead. This can lead to confusion if users don't realize they need to manually add a valid key later.
- **Husky Setup**: If the `package.json` file is not found, the Husky setup is skipped. Users may mistakenly assume Husky is installed if they don't check for this.
- **File Existence Checks**: The code uses `fileExists` to check for the presence of `.gitignore` and `package.json`. If these files are missing, it creates them, but users may not realize they need to configure them afterward.
- **Error Handling**: If any part of the initialization fails, the process exits with a message. Users should be aware that they may need to troubleshoot based on the error message provided.

## Dependencies
- **`chalk`**: Used for colorful console output, enhancing user experience during the command-line interactions.
- **`fs/promises`**: Provides promise-based file system operations, allowing for cleaner asynchronous code.
- **`child_process`**: Used for executing shell commands, specifically for installing Husky and initializing it.
- **`readline`**: Facilitates user input through the console, essential for prompting the user for the API key.
- **`nanospinner`**: Provides a lightweight spinner for indicating progress during asynchronous operations, improving user feedback during the initialization process.

## Architecture Context
This file is part of a command-line interface (CLI) tool designed to integrate with OpenAI's API for knowledge capture in software development. It serves as a setup script that prepares the environment for subsequent commands, ensuring that necessary configurations and hooks are in place for effective usage.

## Implementation Notes
- **User Input Handling**: The `promptUser` function is designed to handle long API keys by trimming whitespace and ensuring clean input. This is crucial for preventing issues with invalid keys due to formatting.
- **Configuration Management**: The code generates both a user-specific configuration file and a template for team sharing. This dual approach helps maintain security while allowing collaboration.
- **Performance Considerations**: The use of async/await with promise-based file operations ensures that the initialization process is non-blocking, providing a smoother user experience. However, users should be aware that any delays in file system operations (e.g., due to permissions) could impact the perceived responsiveness of the CLI.
- **Common Mistakes to Avoid**: Users should ensure they run the command in a Node.js project with a valid `package.json` to enable Husky setup. Additionally, they should verify the API key format to avoid skipping the key-saving step inadvertently.

## Developer Notes

