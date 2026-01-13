---
filePath: agent/prompts.py
fileVersion: 3841cc3ec6316cac1aa3eae40dcb20eff32b855f
lastUpdated: '2026-01-13T10:08:17.358Z'
updatedBy: sb-cli
tags:
  - agent
  - python
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: onboarding-agent
featureRole: helper
userFlows:
  - User can receive personalized onboarding prompts
  - User can navigate the codebase with guided assistance
  - >-
    User can understand file contexts and their relevance to their learning
    goals
relatedFiles:
  - agent/architecture.py
  - agent/features.py
  - agent/tasks.py
---
## Purpose
This file defines system prompts for an onboarding agent, facilitating a conversational and supportive experience for new developers learning a codebase.

## Problem
New developers often struggle with understanding complex codebases, leading to frustration and slow onboarding processes. Before this file, there was no structured approach to guide new users through the learning journey, resulting in inconsistent experiences and knowledge gaps.

## Solution
This file solves the problem by creating structured prompts that the onboarding agent uses to interact with new developers. It leverages a conversational style and includes context about the user's goals, experience level, and current file being viewed. The prompts are designed to be warm and engaging, making the onboarding process feel more approachable and less intimidating.

## Impact
With this file, users can now receive personalized guidance as they navigate the codebase, enhancing their learning experience. Developers can onboard more quickly and effectively, reducing the time it takes to become productive members of the team. The structured prompts also ensure that the onboarding agent provides relevant information without overwhelming the user.

## Architecture Context
This file is part of the onboarding system, which interacts with various components of the codebase. It integrates with user data to tailor prompts based on individual goals and experience levels, ensuring a customized onboarding journey.

## Gotchas (If Applicable)
- The agent must avoid asking users if they are ready to move on, as the prompts are designed to flow naturally without such interruptions. 
- Care should be taken to ensure that file names are pronounced correctly in a conversational manner, as this affects user comprehension and engagement.
