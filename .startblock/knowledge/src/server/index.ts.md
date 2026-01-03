---
filePath: src/server/index.ts
fileVersion: 8d19981434afad46c6ee9594de898c5a04b8c9c2
lastUpdated: '2026-01-03T02:24:27.862Z'
updatedBy: sb-cli
tags:
  - src
  - server
  - typescript
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: server
featureRole: entry_point
userFlows:
  - >-
    User can access API endpoints for knowledge, session, tree, narration,
    livekit, features, and files.
  - User can view the UI served by the Express server.
relatedFiles:
  - ./api/knowledge.js
  - ./api/session.js
  - ./api/tree.js
  - ./api/narration.js
  - ./api/livekit.js
  - ./api/features.js
  - ./api/files.js
  - ../commands/serve.js
---
## Purpose
This file sets up and starts an Express server that serves API routes and static UI files for the application.

## Key Functionality
- `startServer(repoRoot: string, options: ServeOptions)`: Initializes the Express app, sets up middleware, defines API routes, and starts the HTTP server.

## Gotchas
- The CORS middleware is configured for development and should not be used in production without modification.
- The server's shutdown process is designed to be graceful, but if it exceeds 2 seconds, it will forcefully terminate, which could lead to incomplete requests being processed.
- Ensure that `livekitConfig` is properly validated before being passed to `setupLiveKitRoutes`, as incorrect configurations may lead to unexpected behaviors.
- The static file serving relies on a specific directory structure; any changes to the UI build process or output paths will require updates to this code.

## Dependencies
- `express`: Used for setting up the web server and handling requests.
- `chalk`: Utilized for colored console output, improving readability of logs.
- `open`: Automatically opens the server URL in the default browser unless specified otherwise.

## Architecture Context
This file serves as the entry point for the server-side application, coordinating various API routes and serving the frontend UI. It integrates multiple route setups that handle different aspects of the application, ensuring a modular architecture.

## Implementation Notes
- The server defaults to port 3939, which can be overridden via the `options` parameter. This should be documented for users who may want to run multiple instances.
- The CORS configuration allows all origins, which is convenient for development but should be restricted in production.
- The promise-based server start allows for error handling and logging, ensuring that startup issues are communicated effectively to the developer.
