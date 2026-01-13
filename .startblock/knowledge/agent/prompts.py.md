---
filePath: agent/prompts.py
fileVersion: 7c9a3631c50f6bcbccd932eb9df4c4efa103cae1
lastUpdated: '2026-01-13T09:58:02.733Z'
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
  - User can receive personalized onboarding guidance
  - User can smoothly transition between files in the codebase
  - User can understand the context and purpose of each file they encounter
relatedFiles:
  - agent/prompts.py
---
## Purpose
This file defines system prompts for an onboarding agent designed to assist new developers in understanding a codebase through conversational interactions.

## Problem
New developers often struggle to navigate complex codebases, leading to confusion and a steep learning curve. Before this file, there was no structured way to provide personalized guidance and context, which could leave users feeling lost and unsupported during their onboarding journey.

## Solution
The file implements a series of functions that generate prompts for the onboarding agent, including greetings, transitions between files, and system prompts that provide context about the user's goals and the current learning journey. It emphasizes a conversational approach, ensuring the agent communicates in a warm and engaging manner while adhering to specific guidelines for natural language processing.

## Impact
With this file, users can expect a more tailored onboarding experience that feels like a natural conversation rather than a lecture. The onboarding agent can now effectively guide users through the codebase, automatically handling navigation and providing relevant context, which significantly enhances user engagement and retention.

## Architecture Context
This file integrates with the broader onboarding system by providing the necessary prompts that guide user interactions. It relies on user input regarding their goals and experience level, which informs the generated prompts and ensures that the onboarding process is personalized and relevant.

## Gotchas (If Applicable)
- The prompts must avoid asking users if they are ready to move on, as this could disrupt the flow of the conversation. Instead, the system is designed to handle transitions automatically. 
- Care must be taken to ensure that file names are spoken naturally, as this is crucial for maintaining a conversational tone and preventing confusion.
