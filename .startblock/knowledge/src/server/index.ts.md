---
filePath: src/server/index.ts
fileVersion: 58f84348b1e49d79670af734ad811a0504f9e922
lastUpdated: '2025-12-17T01:34:20.646Z'
updatedBy: sb-cli
tags:
  - src
  - server
  - typescript
  - new
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
  - User can serve and interact with the web application's UI.
relatedFiles:
  - src/api/knowledge.js
  - src/api/session.js
  - src/api/tree.js
  - src/api/narration.js
  - src/api/livekit.js
  - src/api/features.js
  - src/api/files.js
  - ../commands/serve.js
---
## Purpose
This file initializes and starts an Express server to handle API requests and serve static files for a web application.

## Key Functionality
- `startServer(repoRoot: string, options: ServeOptions)`: Main function to set up and start the Express server, configure routes, and handle server lifecycle events.

## Gotchas
- CORS is set to allow all origins, which is fine for development but should be restricted in production to avoid security risks.
- The server's graceful shutdown process includes a force exit after 2 seconds, which may not allow ongoing requests to complete, potentially leading to data inconsistency.
- If the specified port is in use, the server provides a user-friendly error message, but this can still lead to confusion if not addressed by the user.
- The static file serving assumes a specific directory structure; any changes to this structure may break the application.

## Dependencies
- `express`: Used for setting up the web server and handling routing.
- `chalk`: Provides colored console output for better readability of logs.
- `open`: Automatically opens the browser to the server URL, enhancing user experience during development.

## Architecture Context
This file serves as the entry point for the server-side application, coordinating various API routes and static file serving, thus forming the backbone of the server's functionality in the overall system architecture.

## Implementation Notes
- The server is configured to listen on a default port of 3939, which can be overridden via options.
- The use of promises for server start and error handling ensures that the server can manage startup failures gracefully.
- The shutdown logic is designed to handle both SIGINT and SIGTERM signals, which is crucial for cloud deployments where these signals are commonly used for graceful termination.
