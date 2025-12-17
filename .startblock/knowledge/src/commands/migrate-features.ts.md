---
filePath: src/commands/migrate-features.ts
fileVersion: 3b416f26343e9cc1cfd6140ef640501273e1831e
lastUpdated: '2025-12-17T01:36:28.381Z'
updatedBy: sb-cli
tags:
  - src
  - commands
  - typescript
  - new
importance: low
extractedBy: sb-cli@1.0.0
model: gpt-4o-mini
humanVerified: false
feature: knowledge-migration
featureRole: entry_point
userFlows:
  - User can migrate knowledge files to include feature metadata
  - >-
    User can view enhanced documentation with feature descriptions and user
    flows
relatedFiles:
  - ../config/loader.js
  - ../core/knowledge-writer.js
  - ../core/openai-client.js
  - ../core/features.js
  - ../core/mermaid-generator.js
---
## Purpose
Migrates existing knowledge files to include feature metadata, enhancing documentation and usability.

## Key Functionality
- `migrateFeaturesCommand`: Main function that orchestrates the migration of knowledge files to include feature metadata.
- `extractImports`: Extracts and resolves import paths from source file content, ensuring only local project files are included.
- `generateFeatureDescription`: Uses AI to generate a concise description of the feature based on the code and user flows.
- `generateUserFlows`: Uses AI to identify user-facing actions enabled by the code.

## Gotchas
- The extraction of imports does not validate the existence of the source files, which may lead to skipped migrations if the file is missing.
- AI-generated content may not always be accurate; the implementation relies on the OpenAI client, and errors in API calls will be logged but not halt execution.
- The recursive search for markdown files could lead to performance issues in deeply nested directories if the number of files is large.

## Dependencies
- `chalk`: Used for console output styling, improving user experience during command execution.
- `nanospinner`: Provides a lightweight spinner for indicating progress during the migration process.
- `gray-matter`: Parses markdown files to extract frontmatter, which is essential for updating knowledge files with feature metadata.
- `OpenAIClient`: Facilitates AI interactions for generating feature descriptions and user flows, crucial for enriching the documentation.

## Architecture Context
This file plays a critical role in enhancing the documentation of features within the application by migrating existing knowledge files to include structured metadata. It integrates AI capabilities to automate the generation of feature descriptions and user flows, thereby improving the overall documentation quality and usability.

## Implementation Notes
- The migration process is designed to be robust, logging warnings for any errors encountered during file processing, but it could be enhanced by implementing retries for transient errors.
- The commented-out check for existing feature metadata indicates a previous consideration for preventing unnecessary migrations, which should be revisited to ensure efficiency.
- The use of AI for generating user flows and descriptions introduces a dependency on external services, which could impact performance and reliability if the service is unavailable.
