---
feature: server
featureRole: implementation
relatedFiles:
  - src/config/loader.ts
  - src/server/index.ts
  - src/utils/file-utils.ts
  - src/utils/intro.ts
tags:
  - server
  - cli
  - command
lastUpdated: 2026-01-02
---

## Problem

User ran `sb serve` and encountered "Failed to get LiveKit token: 400 Bad Request" error. The voice agent wouldn't connect because the server couldn't provide LiveKit credentials to the frontend. The LiveKit credentials were configured in `.sb-config.json` but the serve command wasn't reading them - it only looked for environment variables.

## Solution

Updated `serveCommand` to:

1. Load configuration using `loadConfig(repoRoot)` at startup
2. Pass `livekitConfig` from the loaded config to `startServer` via `ServeOptions`
3. This ensures LiveKit credentials defined in `.sb-config.json` are properly used by the server

## Impact

Now users can configure LiveKit credentials in their `.sb-config.json` file instead of having to set environment variables. The serve command will automatically read and use these credentials to provide tokens to the frontend, enabling the voice agent to connect.
