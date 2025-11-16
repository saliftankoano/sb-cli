---
filePath: src/utils/boxes.ts
fileVersion: unknown
lastUpdated: '2025-11-16T21:33:52.205Z'
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
# Documentation for `src/utils/boxes.ts`

## Purpose
This file provides utility functions to create styled boxes for a Command Line Interface (CLI) user interface using the `boxen` library. It centralizes box configurations to ensure consistent styling across different messages.

## Key Functionality
- **`analysisContextBox(commitMessage: string, stagedCount: number, analyzedCount: number): string`**  
  Generates a styled box displaying the commit message along with the counts of staged and analyzed files.

- **`wizardPromptBox(): string`**  
  Creates a whimsical prompt box inviting developers to share insights or gotchas, enhancing team communication.

- **`readyToCommitBox(knowledgeFileCount: number): string`**  
  Produces a confirmation box indicating the number of knowledge files ready for committing, reinforcing the completion of a task.

## Gotchas
- **Styling Consistency**: Ensure that the padding, margin, and border styles are consistently applied across all boxes. Any deviation can lead to a disjointed user experience.
  
- **Text Length**: If the `commitMessage` in `analysisContextBox` is excessively long, it may cause the box to overflow or not render correctly. Consider truncating long messages or implementing a character limit.

- **Color Visibility**: The chosen border colors may not be visible on all terminal backgrounds. Test the output in various terminal themes to ensure readability.

## Dependencies
- **`boxen`**: This library is used for creating styled boxes in the CLI. It simplifies the process of formatting text with borders and padding, allowing for a more visually appealing output without manual string manipulation.

## Architecture Context
This utility file is part of a larger CLI tool aimed at enhancing developer productivity by providing clear visual feedback during code analysis and commit processes. It helps maintain a consistent user interface across different parts of the application.

## Implementation Notes
- **Centralized Configuration**: The use of centralized box configurations allows for easy updates to styling in one location, promoting maintainability.
  
- **Performance Considerations**: The functions are lightweight and primarily involve string manipulation. However, excessive calls with large strings could impact performance. Monitor usage in scenarios with frequent updates to the CLI output.

- **Common Mistakes**: Avoid hardcoding styles directly in the function calls; instead, consider defining a style configuration object to maintain consistency and ease of updates.

## Developer Insights

Changed the approach for the current commit instead of using the pre-commit now we use the commit-msg from husky to get the current commit message reliably. This had a domino effect on a couple files from operation to analyzer. Then we ran into the issue of permissions when using the sb cli so we added a postbuild script to make the index.js execuatable after each build.

*Captured during commit: fix getCurrentCommit & update readme*
