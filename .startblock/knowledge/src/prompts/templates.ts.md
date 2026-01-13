---
filePath: src/prompts/templates.ts
fileVersion: f3d1f19051849c62abadd3659f559b94ffab6c94
lastUpdated: '2026-01-13T10:49:43.475Z'
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
  - Developer can generate documentation for code files
  - Developer can analyze code changes with context and rationale
relatedFiles:
  - src/prompts/index.ts
---
## Purpose
This file provides a mechanism to generate structured prompts for analyzing code files, aimed at producing comprehensive documentation automatically.

## Problem
Prior to this implementation, generating documentation for code files was a manual and inconsistent process, leading to gaps in knowledge sharing and understanding among team members. This inconsistency made it difficult for developers to grasp the context and rationale behind code changes, which could result in repeated mistakes or misunderstandings.

## Solution
This file defines a function that constructs a detailed prompt for OpenAI's analysis based on the context of the code file. It captures essential information such as the file path, language, git status, and existing documentation. The approach leverages a template system to ensure that all relevant aspects of the code are considered, including problems faced, solutions implemented, and design rationale. By doing so, it standardizes the documentation process and enhances clarity.

## Impact
With this file, developers can now automatically generate insightful documentation for their code changes, which improves onboarding for new team members and facilitates better collaboration. The inclusion of failed attempts and design rationale also fosters a culture of learning and continuous improvement, as it allows the team to reflect on past decisions and avoid repeating errors.

## Architecture Context
This file fits into the larger system by serving as a helper utility that interacts with the codebase to extract relevant information and format it for documentation. It relies on the context provided by the calling functions, which include details about dependencies and the overall structure of the project.

## Gotchas (If Applicable)
Developers should ensure that the context provided to the prompt generation function is complete and accurate, as missing information could lead to incomplete documentation. Additionally, care should be taken to maintain the template structure to avoid inconsistencies in generated outputs.
