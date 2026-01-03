---
feature: onboarding-agent
featureRole: implementation
relatedFiles:
  - agent/run.sh
  - agent/knowledge_loader.py
  - agent/prompts.py
  - agent/commands.py
tags:
  - agent
  - python
  - debugging
lastUpdated: 2026-01-02
---

## Problem

After fixing the LiveKit token issue, the voice agent connected successfully but wasn't speaking. The agent was sending UI commands (visible in browser console logs showing "ShowFileCommand" received) but no audio was playing. User couldn't tell if the issue was:

- Browser audio autoplay blocking
- OpenAI TTS API failing silently
- Agent code hanging during greeting generation

The lack of detailed logging made it impossible to diagnose where the agent was failing.

## Solution

Added comprehensive debug logging and error handling:

1. Wrapped `generate_reply()` in try/catch with explicit error logging and traceback
2. Added "Calling generate_reply" and "generate_reply completed" logs
3. Enabled `PYTHONUNBUFFERED=1` in `run.sh` to prevent Python output buffering

## Impact

Now when the agent fails to speak, the terminal will show:

- If it's calling generate_reply (agent logic is working)
- If generate_reply throws an error (OpenAI API issue)
- Full error traceback for debugging

This helps diagnose whether the issue is:

- Backend (agent/OpenAI errors) - visible in terminal
- Frontend (audio autoplay/playback) - requires browser debugging
