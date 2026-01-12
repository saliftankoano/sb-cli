---
filePath: agent/knowledge_loader.py
fileVersion: 4285be8799bdc15d12625e1ae00e75a6ff1c46c4
lastUpdated: '2026-01-12T00:25:41.655Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: knowledge-loader
featureRole: helper
userFlows:
  - User can view a summary of system features
  - User can understand the capabilities of specific features
  - User can access related files for each feature
relatedFiles: []
---
## Purpose
Utilities for formatting knowledge context.

## Problem
Before this file, there was no systematic way to summarize and present feature documentation for the agent. This lack of organization made it difficult for users and developers to quickly understand the capabilities of different features and their associated files. The situation prompted the need for a utility that could format and present this information clearly.

## Solution
This file provides functions to format feature summaries and contexts. It categorizes features, formats them into readable summaries, and extracts relevant information such as user flows and dependencies. The key approach involves grouping features by category and generating structured output that highlights important details in a user-friendly manner.

## Impact
With this file, users and developers can easily access and understand the features available in the system. It enhances the onboarding experience and improves documentation clarity, allowing for quicker feature discovery and comprehension. This ultimately leads to better utilization of the system's capabilities.

## Architecture Context
This file fits into the agent's documentation system, where it serves as a utility for formatting and summarizing feature data. It interacts with feature data structures and is likely called by other components that manage feature documentation and presentation.

## Gotchas (If Applicable)
Ensure that feature data is complete and well-structured; missing or improperly formatted data can lead to incomplete summaries. There are no significant performance traps noted, but careful handling of edge cases is necessary to maintain output quality.
