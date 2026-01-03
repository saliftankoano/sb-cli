---
filePath: ui/vite.config.ts
fileVersion: e79e872063ecc7ae9518cd8ed987b60af3b96e2f
lastUpdated: '2026-01-03T02:24:27.877Z'
updatedBy: sb-cli
tags:
  - ui
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: vite-config
featureRole: config
userFlows: []
relatedFiles: []
---
## Purpose
This file configures Vite for a React application, optimizing the build process and managing dependencies.

## Key Functionality
- `defineConfig`: Exports the Vite configuration object.
- `plugins`: Includes the React plugin for Vite.
- `optimizeDeps`: Specifies dependencies to be pre-bundled for faster development.
- `build`: Configures build options, including output directory and chunking strategy.
- `resolve`: Sets up path aliases for easier imports.

## Gotchas
- The manualChunks function must be carefully maintained; adding or removing dependencies without updating this function can lead to unexpected bundle sizes and load times.
- If the output directory structure changes, the `outDir` path must be updated accordingly to avoid build errors.
- Ensure that all dependencies listed in `optimizeDeps` are actually used in the application to avoid unnecessary bloat in the build process.

## Dependencies
- `@vitejs/plugin-react`: Essential for enabling React support in the Vite build process.
- `d3-sankey`: Included in optimizeDeps for performance; it is a specific library used in the application, ensuring it is pre-bundled for faster access during development.

## Architecture Context
This configuration file plays a crucial role in the build and development process of the React application, ensuring that the application is optimized for performance and maintainability.

## Implementation Notes
- The `emptyOutDir` option is particularly important for preventing stale files from being served, which can lead to confusion during development.
- The choice to split certain libraries into separate chunks (like 'livekit-vendor' and 'markdown-vendor') is aimed at optimizing load times and caching strategies for users, as these libraries may be large and not change frequently.
- The use of path aliases improves the maintainability of the codebase by reducing the complexity of import statements.
