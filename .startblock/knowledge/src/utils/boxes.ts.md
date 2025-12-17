---
filePath: src/utils/boxes.ts
fileVersion: 79dc587a54bf5e8f93eb7da2b0224b92b3653c1b
lastUpdated: '2025-12-17T01:36:28.387Z'
updatedBy: sb-cli
tags:
  - src
  - utils
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: gitflash
featureRole: helper
userFlows:
  - User can view analysis context before committing
  - User can receive a prompt for insights during the process
  - User can see an estimate of the cost and time for GitFlash operations
  - User can track progress of GitFlash operations
relatedFiles:
  - ../utils/intro.js
  - ./cost-estimator.js
---
# Purpose
This file provides styled boxes for CLI UI using the `boxen` library, centralizing box configurations for consistent styling.

# Key Functionality
- `analysisContextBox(stagedCount: number, analyzedCount: number): string`: Displays the context of the analysis with staged and analyzed file counts.
- `wizardPromptBox(): string`: Prompts the user for developer insights in a wizard-like format.
- `readyToCommitBox(knowledgeFileCount: number): string`: Confirms the readiness of knowledge files for committing.
- `gitflashEstimateBox(estimate: CostEstimate): string`: Shows an estimate of GitFlash operations including commits, files, cost, and time.
- `gitflashProgressLine(current: number, total: number, message: string): string`: Displays a progress line with a bullet point and current/total count.

# Gotchas
- Ensure that the `CostEstimate` passed to `gitflashEstimateBox` contains all required properties to avoid runtime errors.
- Excessive calls to `gitflashProgressLine` without throttling can lead to performance issues due to string creation in a loop.

# Dependencies
- `boxen`: Used for creating styled boxes in the CLI, enhancing readability and user interaction.
- `chalk`: Provides color styling for terminal output, improving the visual aspect of messages.
- `brandColor`: A utility function that standardizes color branding across the CLI outputs.

# Architecture Context
This file is part of the utility functions that enhance the CLI experience for GitFlash, providing visual feedback and prompts to the user during Git operations.

# Implementation Notes
- The design choice to centralize box configurations allows for easy updates and consistent styling across different messages.
- The `chalk` library is leveraged to improve the user experience by making the output more visually engaging, which is particularly important in CLI applications where user interaction can be minimal.
- The functions are designed to be reusable, promoting DRY principles in the codebase.
