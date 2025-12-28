---
filePath: src/index.ts
fileVersion: d41e59db13aa62aec5746fa874be5a4422d7eb22
lastUpdated: '2025-12-28T17:47:07.406Z'
updatedBy: sb-cli
tags:
  - src
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: cli-command-handler
featureRole: entry_point
userFlows:
  - User can initialize the Startblock in their current repository
  - User can analyze staged files for documentation
  - User can run onboarding to generate documentation
  - User can simulate an intro animation
  - User can start a visual onboarding server
  - User can migrate existing knowledge files to a feature-based format
relatedFiles:
  - commands/init.js
  - commands/analyze-commit.js
  - commands/simulate-intro.js
  - commands/onboard.js
  - commands/setup-onboarding.js
  - commands/migrate-features.js
  - commands/gitflash.js
---
## Purpose
This file serves as the main entry point for the command-line interface, orchestrating various commands based on user input.

## Key Functionality
- `main()`: The primary function that processes commands and executes corresponding actions.
- `getVersion()`: Retrieves the current version of the application from package.json.
- `showHelp()`: Displays the help message with available commands and usage instructions.

## Gotchas
- The command handling is case-sensitive; providing an unknown command will lead to an error and display the help message, which may confuse users not familiar with the CLI.
- The `--postinstall` flag in the `onboard` command is critical for automatic onboarding; its absence requires manual invocation, potentially leading to missed onboarding opportunities.
- Error handling is generic, which may not provide sufficient context for debugging if the error is not clear.

## Dependencies
- `chalk`: Used for colorful console output, enhancing user experience by making the CLI more readable and engaging.

## Architecture Context
This file fits into the larger system as the entry point for the CLI, allowing users to interact with various commands that manage knowledge capture and onboarding processes.

## Implementation Notes
- The `getVersion` function defaults to 'unknown' if the package.json cannot be read, which could mislead users into thinking they are using an outdated version.
- The design pattern used for command handling is straightforward but could be improved with a more modular approach to enhance maintainability and scalability.
