---
filePath: src/prompts/templates.ts
fileVersion: 9674f2f871b9b2558c7acd2b813bcfa34f2cea42
lastUpdated: '2026-01-13T10:20:26.975Z'
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
  - Developers can generate structured documentation for their code.
  - >-
    Team members can understand the rationale behind design decisions more
    clearly.
relatedFiles: []
---
## Purpose
This file provides a template for generating structured documentation for code analysis, focusing on the rationale behind design decisions and the impact of the code.

## Problem
Before this file existed, there was a lack of standardized documentation practices that captured not only what the code does but also why certain approaches were chosen. This often led to confusion among developers and a higher likelihood of repeating mistakes.

## Solution
The file introduces a systematic prompt that guides developers in documenting their code. It emphasizes capturing the problem, attempts, solution, rationale, and impact, ensuring that future developers understand the context and reasoning behind design choices. This structured approach helps maintain clarity and consistency across documentation.

## Impact
With this documentation template, developers can now produce comprehensive and insightful documentation that aids in onboarding new team members, facilitates code reviews, and enhances collaboration. It ultimately leads to a more informed development process and better software quality.

## Architecture Context
This file fits into the larger system by serving as a foundational tool for generating documentation across various modules. It integrates with the codebase to ensure that all components are well-documented, enhancing overall maintainability and knowledge sharing.

## Gotchas (If Applicable)
Developers should be aware that while capturing failed attempts is encouraged, it is essential to focus on significant failures that provide valuable lessons, rather than trivial issues that do not contribute to the learning process.
