---
filePath: src/server/api/livekit.ts
fileVersion: 1b783e65430147947652a7193cf209ec2b331aa9
lastUpdated: '2026-01-12T00:31:53.106Z'
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
featureRole: entry_point
userFlows:
  - User can join an onboarding session in a LiveKit room
  - User can receive an access token for room participation
relatedFiles:
  - context-provider.js
---
## Purpose
This file sets up API routes for managing LiveKit rooms and generating access tokens for users in an onboarding context.

## Problem
Prior to this implementation, there was no streamlined way to create and manage LiveKit rooms for onboarding sessions, leading to potential issues with user access and session management. The lack of a dynamic room creation process hindered real-time collaboration and context sharing among users.

## Solution
This file addresses the problem by providing an Express router that handles the creation of LiveKit rooms based on incoming requests. It uses the `RoomServiceClient` to create rooms with metadata and generates access tokens for users, allowing them to join the appropriate room with the necessary permissions. The implementation simplifies the onboarding process by dynamically generating room names and managing user access efficiently.

## Impact
With this file, developers can now easily integrate LiveKit for real-time collaboration in onboarding sessions. Users can join unique rooms tailored to their sessions, enhancing the overall user experience and enabling effective context sharing. This leads to improved onboarding processes and better resource management on the server side.

## Architecture Context
This file integrates with the LiveKit SDK to manage real-time communication. It relies on environment variables for configuration, ensuring flexibility in different deployment scenarios. The router exposes an endpoint for token generation, which is crucial for user authentication and room access.

## Gotchas (If Applicable)
- Ensure that the LiveKit configuration (URL, API key, and secret) is correctly set in the environment to avoid errors during room creation.
- The previous implementation included persistent room connections, which have been removed; ensure that any dependencies on that behavior are updated accordingly.
