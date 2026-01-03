---
filePath: src/server/api/livekit.ts
fileVersion: 47a0fae09d8add3f6e041cab60a1cfc07b8b24c0
lastUpdated: '2026-01-03T02:24:27.861Z'
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
feature: livekit
featureRole: entry_point
userFlows:
  - User can generate a LiveKit token for real-time communication
  - User can create or join a communication room
relatedFiles:
  - src/server/api/livekit.ts
  - src/server/api/anotherFile.ts
---
## Purpose
This file sets up API routes for generating LiveKit tokens necessary for real-time communication sessions.

## Key Functionality
- `setupLiveKitRoutes(repoRoot: string, config?: { url?: string; apiKey?: string; apiSecret?: string }): Router`: Configures the router with a POST endpoint to generate LiveKit tokens.

## Gotchas
- Credentials can be provided via environment variables or a config object; ensure both are validated to prevent errors.
- If a room already exists, the error from creating the room is caught and ignored, which can lead to confusion if the room creation fails silently.
- Room names are generated using session IDs or timestamps, which may lead to collisions if not managed properly.
- The AccessToken identity is based on timestamps, which may not be unique across different sessions.

## Dependencies
- `express`: Used for routing and handling HTTP requests.
- `livekit-server-sdk`: Provides the necessary classes to interact with LiveKit services for room creation and token generation.

## Architecture Context
This file is part of the server-side API that facilitates real-time communication features in the application, integrating with LiveKit for managing sessions and tokens.

## Implementation Notes
- The addition of the config parameter allows for more flexible deployment configurations.
- Ensure that error handling is robust, especially for token generation and room creation, to avoid runtime issues during high load or unexpected states.
