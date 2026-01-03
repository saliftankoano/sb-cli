---
feature: livekit-setup
featureRole: implementation
relatedFiles:
  - src/server/index.ts
tags:
  - livekit
  - api
  - server
lastUpdated: 2026-01-02
---

## Problem

The `/api/livekit/token` endpoint was hardcoded to only check `process.env` for LiveKit credentials. When a user had credentials in `.sb-config.json` but not in environment variables, the endpoint would return a 400 error, causing the frontend to fail with "Failed to get LiveKit token". This prevented the voice agent from connecting.

## Solution

Updated `setupLiveKitRoutes` to:

1. Accept an optional `config` parameter containing LiveKit credentials (`url`, `apiKey`, `apiSecret`)
2. Check both `process.env` AND the provided `config` object for credentials
3. Prioritize environment variables but fall back to config values
4. Updated error message to mention both sources

## Impact

The route now supports two configuration methods:

- Environment variables (takes precedence for security in production)
- Configuration file values (convenient for development)

This fixes the 400 error and allows users to configure credentials in `.sb-config.json` for easier local development.
