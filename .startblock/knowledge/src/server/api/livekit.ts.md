---
filePath: src/server/api/livekit.ts
fileVersion: c766688c23eea47221c7fbd5175bbbd63c3c579f
lastUpdated: '2025-12-17T01:30:42.349Z'
updatedBy: sb-cli
tags:
  - src
  - server
  - api
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: livekit-setup
featureRole: entry_point
userFlows:
  - User can generate a LiveKit token for onboarding sessions
  - User can create or join a LiveKit room for real-time communication
relatedFiles:
  - ../../config/loader.js
---
## Purpose
This file sets up API routes for generating LiveKit tokens and managing rooms for real-time communication.

## Key Functionality
- `setupLiveKitRoutes(repoRoot: string): Router`: Configures the Express router with a POST endpoint for generating LiveKit tokens.

## Gotchas
- LiveKit credentials are now strictly sourced from environment variables, and users of the CLI do not need to provide them, which can lead to confusion if not documented properly.
- The room creation process is designed to be idempotent; if a room already exists, the error is caught and ignored, which may lead to unexpected behavior if not understood.
- The access token generation includes permissions that allow users to join and interact with the room, which is crucial for ensuring proper access control during onboarding sessions.
- The room name generation uses the current timestamp if no session ID is provided, which may lead to non-unique room names if multiple requests are made in quick succession.

## Dependencies
- `express`: Used for creating the API routes.
- `livekit-server-sdk`: Provides the necessary classes for generating access tokens and managing rooms in LiveKit.

## Architecture Context
This file is part of the server-side implementation for handling real-time communication features, specifically focusing on token generation and room management for onboarding sessions.

## Implementation Notes
- The decision to source LiveKit credentials from environment variables simplifies configuration for end users but requires clear documentation to avoid confusion.
- The use of `Date.now()` for generating room names ensures that room names are unique unless multiple requests occur at the same millisecond, which could be a potential edge case to monitor for.
- The implementation handles errors gracefully, logging them and responding with a 500 status code, which is important for maintaining a good user experience during failures.
