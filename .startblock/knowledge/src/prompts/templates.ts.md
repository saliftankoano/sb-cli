---
filePath: src/prompts/templates.ts
fileVersion: 46244646df75c99f7a1f53b04527252ac10fb4e7
lastUpdated: '2026-01-03T02:24:27.860Z'
updatedBy: sb-cli
tags:
  - src
  - prompts
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: prompts-templates
featureRole: helper
userFlows:
  - Developers can generate structured documentation for code analysis
  - Users can understand the rationale behind code decisions
  - Team members can onboard more effectively with clear documentation
relatedFiles: []
---
## Purpose
This file provides a template for generating knowledge documentation for code analysis, focusing on the story behind the code, including the problem it solves, how it solves it, and its impact.

## Problem
Before this file existed, there was no standardized way to document code that effectively conveyed the rationale behind its existence. This often led to misunderstandings and a lack of clarity in how different parts of the codebase interacted.

## Solution
The file introduces a structured prompt that guides users in documenting code by emphasizing the capture of problem, solution, and impact. It also includes contextual information such as commit history and existing documentation to enrich the documentation process.

## Impact
Users and developers can now produce more meaningful documentation that not only describes what the code does but also explains why it exists and how it fits into the larger system. This improves knowledge transfer and aids in onboarding new team members.

## Architecture Context
This file fits into the larger system by serving as a foundational component for documentation generation. It interacts with various parts of the codebase by referencing dependencies and dependents, which helps in understanding the flow of data and control within the application.

## Gotchas (If Applicable)
- Ensure that the context provided in the prompt is accurate; otherwise, it may mislead users about the code's purpose.
- Be cautious when modifying the structure of the prompt, as changes can affect the clarity and usefulness of the generated documentation.
