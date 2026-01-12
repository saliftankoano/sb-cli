---
filePath: src/server/api/livekit.ts
fileVersion: 9674f2f871b9b2558c7acd2b813bcfa34f2cea42
lastUpdated: '2026-01-12T00:25:41.660Z'
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
feature: livekit-onboarding
featureRole: service
userFlows:
  - Agent can connect to a LiveKit room for onboarding
  - Agent receives initial context upon joining a room
  - Agent can request specific file content during the session
relatedFiles:
  - ./context-provider.js
---
## Purpose
This file sets up API routes for managing LiveKit connections, enabling real-time context sharing during onboarding sessions.

## Problem
Before this file, there was no mechanism for the server to provide real-time context to participants in onboarding sessions using LiveKit. This lack of context sharing could lead to disjointed experiences for agents, making it difficult for them to access necessary information during their interactions.

## Solution
This file connects the server to LiveKit rooms, allowing it to act as a context provider. It creates rooms dynamically based on session IDs and manages participant connections. When an agent connects, the server sends them relevant onboarding context and responds to specific requests for file content, thereby enhancing the onboarding experience.

## Impact
Users can now have a seamless onboarding experience where they receive real-time context and file information directly from the server. This capability improves the efficiency of agents by providing them with the information they need as they interact with the system.

## Architecture Context
This file integrates with the LiveKit SDK to manage rooms and participants. It relies on environment variables for configuration and interacts with the context-provider module to fetch onboarding context and file knowledge. The data flow involves receiving requests from agents, processing them, and sending back relevant information through LiveKit's data channels.

## Gotchas (If Applicable)
- Ensure that the LiveKit credentials are correctly set in the environment or configuration; otherwise, the server will fail to connect to rooms.
- The activeRooms map is crucial for managing connections; failing to track this can lead to unnecessary resource consumption or connection issues.
- Error handling is essential, particularly in the dataReceived event, to prevent crashes from malformed messages or unexpected payloads.
