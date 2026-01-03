---
feature: onboarding-agent
featureRole: script
relatedFiles:
  - agent/main.py
tags:
  - agent
  - script
  - debugging
lastUpdated: 2026-01-02
---

## Problem

When debugging the silent voice agent issue, Python's default output buffering was delaying log messages. This meant that critical debug logs (like "[DEBUG] Calling generate_reply for greeting...") wouldn't appear in the terminal immediately, making it impossible to diagnose issues in real-time. The agent could be failing but the logs wouldn't show until much later or after the process ended.

## Solution

Added `export PYTHONUNBUFFERED=1` before running the Python agent. This disables Python's output buffering, ensuring that all `print()` statements appear in the terminal immediately as they execute.

## Impact

Developers can now see agent logs in real-time, making it possible to:

- Track exactly where the agent is in its execution flow
- Catch errors immediately when they occur
- Correlate agent behavior with UI actions in real-time
- Debug timing-sensitive issues more effectively
