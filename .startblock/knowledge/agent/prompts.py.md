---
filePath: agent/prompts.py
fileVersion: 0f6c7a202946c89ca89cbdaa6a1d864ead62c9e1
lastUpdated: '2026-01-12T22:13:27.198Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: agent-prompts
featureRole: helper
userFlows:
  - User can receive personalized onboarding prompts based on their context
  - User can view relevant source code snippets during onboarding
  - User can smoothly transition between files with contextual guidance
relatedFiles: []
---
## Purpose
This file generates system prompts for an onboarding agent, helping users navigate and understand a codebase effectively.

## Problem
Before this file, onboarding new developers to a codebase was often inconsistent and lacked personalization. New users struggled to grasp the context of files and their relevance to their learning goals, leading to confusion and slower onboarding processes.

## Solution
This file addresses the onboarding challenge by creating dynamic prompts that incorporate user-specific information such as their name, experience level, and current file context. It uses functions to build prompts that guide users through the codebase, providing explanations, context, and even raw file content when available. This tailored approach enhances user engagement and understanding.

## Impact
With this file, users can receive personalized guidance as they explore the codebase, significantly improving their onboarding experience. Developers can now learn at their own pace, with prompts that adapt to their journey, making it easier to connect concepts and files. This leads to faster ramp-up times and a more effective learning process.

## Architecture Context
This file is part of the agent system that interacts with users during their onboarding journey. It integrates with other components that manage user data and file knowledge, ensuring that prompts are relevant and contextually aware. The flow of information is designed to be seamless, allowing for a smooth user experience as they transition between different parts of the codebase.

## Gotchas (If Applicable)
- Ensure that the current file content is accurately passed to the prompt builder; otherwise, users may miss out on critical context.
- The truncation logic in the `_truncate_section` function may lead to incomplete information if not handled carefully, especially for larger documents.
