---
filePath: agent/prompts.py
fileVersion: 58f84348b1e49d79670af734ad811a0504f9e922
lastUpdated: '2025-12-17T01:33:56.188Z'
updatedBy: sb-cli
tags:
  - agent
  - python
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: onboarding-agent
featureRole: helper
userFlows:
  - User can receive personalized onboarding prompts
  - User can understand codebase structure through guided prompts
  - User can transition smoothly between different files during onboarding
relatedFiles: []
---
## Purpose
This file defines system prompts for an onboarding agent, enabling dynamic and context-aware interactions with users as they navigate a codebase.

## Key Functionality
- `make_speakable_path(file_path: str) -> str`: Converts file paths into a TTS-friendly format, making them easier to articulate.
- `build_system_prompt(...) -> str`: Constructs a detailed system prompt for the onboarding agent, incorporating user-specific context and journey information.
- `build_greeting_prompt(...) -> str`: Generates an initial greeting prompt tailored to the user’s goal and experience level.
- `build_transition_prompt(...) -> str`: Creates a prompt for transitioning between files, maintaining a conversational flow.
- `_truncate_section(content: str, max_chars: int) -> str`: Truncates long content while preserving whole lines for better readability.

## Gotchas
- The `make_speakable_path` function assumes that file paths will always contain a filename and may return unexpected results if the input is malformed (e.g., empty strings or paths without a filename).
- The optional parameters in `build_system_prompt` can lead to incomplete prompts if not provided correctly; developers should ensure they are passing the necessary context.
- The `_truncate_section` function may truncate important context if the content is too long, potentially leading to misunderstandings if the truncated content is critical for comprehension.

## Dependencies
The file relies on standard Python typing for type hints, which aids in code clarity and helps developers understand expected input and output types.

## Architecture Context
This file plays a crucial role in the onboarding feature by generating prompts that guide users through understanding the codebase, thus enhancing the overall user experience during onboarding.

## Implementation Notes
- The conversational tone of the prompts is intentional to create a welcoming environment for users, especially beginners.
- Careful attention is given to how file names are articulated to ensure clarity when using TTS, which is a key aspect of the user interaction model.
- The design allows for extensibility, as additional context can be added to prompts without significant changes to the core logic, making it adaptable for future requirements.
