---
filePath: src/server/api/livekit.ts
fileVersion: 865536330a1cc5cf89f436352091701359f959dd
lastUpdated: '2026-01-12T04:20:22.723Z'
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
feature: livekit-integration
featureRole: service
userFlows:
  - User can join an onboarding session with real-time communication features
  - User can receive a unique access token for session participation
relatedFiles:
  - livekit-server-sdk.ts
---
## Purpose
This file sets up API routes for generating LiveKit access tokens and managing room creation for onboarding sessions.

## Problem
Before this file, there was no mechanism to dynamically create rooms and generate access tokens for users in real-time communication scenarios. This lack of functionality hindered the ability to facilitate onboarding sessions effectively, where users need to join live interactions.

## Solution
The file implements an Express router that listens for POST requests to the `/token` endpoint. It checks for necessary LiveKit configuration, creates a room using the LiveKit SDK, and generates an access token for users. The room name is dynamically generated based on session IDs or timestamps to prevent conflicts and ensure uniqueness.

## Impact
With this implementation, users can seamlessly join onboarding sessions with real-time communication capabilities. Developers can now integrate LiveKit's features into their applications, enhancing user experience and enabling collaborative functionalities.

## Architecture Context
This file integrates with the LiveKit server SDK and relies on environment variables for configuration. It fits within the broader application architecture by providing a backend service that interacts with the LiveKit API to manage real-time communication sessions.

## Gotchas (If Applicable)
- Ensure that LiveKit credentials are correctly set in the environment or configuration files; otherwise, requests will fail.
- The room creation process may silently fail if a room with the same name already exists, which could lead to confusion if not handled properly.
