---
filePath: src/server/api/livekit.ts
fileVersion: 58f84348b1e49d79670af734ad811a0504f9e922
lastUpdated: '2025-12-16T01:02:43.094Z'
updatedBy: sb-cli
tags:
  - src
  - server
  - api
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: livekit-integration
featureRole: entry_point
userFlows:
  - User can generate a LiveKit token for real-time communication
  - User can create or join a LiveKit room for onboarding sessions
relatedFiles:
  - ../../config/loader.js
---
## Purpose
This file sets up API routes for generating LiveKit tokens and creating rooms for real-time communication.

## Key Functionality
- `setupLiveKitRoutes(repoRoot: string): Router`: Initializes the Express router with a POST endpoint for generating LiveKit access tokens and creating rooms.

## Gotchas
- If environment variables or configuration values are missing, it returns a 400 error, which may not be immediately obvious to users expecting a different response.
- The room creation is idempotent; if a room already exists, it silently continues without throwing an error, which could lead to confusion if not documented.
- The access token is generated with a unique identity based on the current timestamp, which could lead to potential issues if multiple tokens are generated in quick succession.

## Dependencies
- `livekit-server-sdk`: Used to interact with LiveKit services for room management and token generation. This SDK abstracts the complexities of WebSocket connections and API interactions with LiveKit.
- `express`: Provides routing capabilities for handling HTTP requests.
- `../../config/loader.js`: Loads configuration settings, which is essential for setting up LiveKit with the correct parameters.

## Architecture Context
This file is part of the server-side API that facilitates real-time communication features in the application, allowing users to join rooms and interact in real-time. It integrates with LiveKit to manage sessions and tokens, which are critical for enabling user interactions.

## Implementation Notes
- The use of default LiveKit credentials is intended for testing; developers should ensure these are replaced with secure values in production.
- The metadata for the room includes the repo root, which is crucial for agents to load the correct context, but this might not be clear to all developers. 
- Error handling is implemented for token generation, but the catch block for room creation does not provide feedback if the room already exists, which could lead to silent failures in some scenarios.
