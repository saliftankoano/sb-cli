---
filePath: ui/src/lib/api.ts
fileVersion: e79e872063ecc7ae9518cd8ed987b60af3b96e2f
lastUpdated: '2025-12-17T01:30:42.352Z'
updatedBy: sb-cli
tags:
  - ui
  - src
  - lib
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: api
featureRole: service
userFlows:
  - User can fetch available features
  - User can access onboarding documentation
  - User can retrieve a LiveKit token for real-time communication
  - User can view the file structure of the project
relatedFiles: []
---
## Purpose
This file acts as an API client for fetching data related to features, onboarding documentation, and knowledge management within the application.

## Key Functionality
- `fetchFeatures`: Retrieves the list of features from the API.
- `fetchOnboardingDocs`: Fetches onboarding documentation.
- `fetchLiveKitToken`: Obtains a LiveKit token for real-time communication, utilizing a configurable URL.
- `fetchKnowledge`: Fetches knowledge files related to the application.
- `fetchTree`: Retrieves the file structure of the project.

## Gotchas
- The `fetchLiveKitToken` function requires a `sessionId` parameter; if the backend expects this and it is not provided, it may lead to unexpected behavior or errors.
- The `fetchOnboardingDocs` function returns an empty array if the response is not OK, which may mask underlying issues; developers should log or handle this case appropriately.
- Ensure that the environment variable `NEXT_PUBLIC_LIVEKIT_TOKEN_URL` is set correctly in production to avoid fallback to the default URL, which may not be valid.

## Dependencies
- The file relies on the `fetch` API for making HTTP requests, which is standard in modern JavaScript environments. The use of environment variables allows for flexibility in different deployment environments.

## Architecture Context
This file is part of the application's service layer, facilitating communication with the backend API. It abstracts the details of API interaction, allowing other parts of the application to focus on business logic and user interface.

## Implementation Notes
- The decision to use environment variables for the LiveKit token URL enhances configurability and supports different deployment scenarios.
- Consistent error handling across all fetch functions ensures that developers can easily manage API errors, but they must ensure that the backend adheres to expected status codes for this to be effective.
- The file is structured to support both synchronous and asynchronous operations, making it suitable for use in a variety of contexts within the application.
