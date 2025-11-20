# Contributing to Startblock CLI

Thank you for your interest in contributing to Startblock CLI! This guide will help you set up your development environment and understand the project structure.

## Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- git

## Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/startblock/sb-cli.git
   cd sb-cli
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**

   ```bash
   npm run build
   ```

   This compiles TypeScript to JavaScript in the `dist/` directory and makes the binary executable.

4. **Link locally for testing:**

   ```bash
   npm link
   ```

   This allows you to use the `sb` command globally on your machine, pointing to your local source code.

5. **Watch mode (optional):**

   For active development, you can run the TypeScript compiler in watch mode:

   ```bash
   npm run dev
   ```

## Project Structure

```
sb-cli/
├── src/
│   ├── commands/          # CLI command implementations (init, analyze-commit)
│   ├── core/              # Core logic (analyzer, OpenAI client)
│   ├── git/               # Git operations wrapper
│   ├── prompts/           # AI prompt templates
│   ├── utils/             # Utility functions (boxes, formatting)
│   └── index.ts           # Entry point
├── .husky/                # Git hooks configuration
├── dist/                  # Compiled JavaScript (generated)
└── tsconfig.json          # TypeScript configuration
```

## Testing Your Changes

Since this is a CLI tool that integrates with Git hooks, testing often involves simulating usage in a separate repository.

1. **Create a test repo:**

   See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for a complete walkthrough of creating a test environment.

2. **Test specific commands:**

   You can test commands directly in the CLI repo or your test repo:

   ```bash
   # Test help
   sb --help

   # Test intro animation
   sb sim-intro
   ```

## Publishing to npm

1. **Update version:**

   Bump the version in `package.json`. Follow semantic versioning.

2. **Build:**

   ```bash
   npm run build
   ```

   Ensure the build succeeds and `dist/index.js` is executable.

3. **Check npmignore:**

   Verify that `.npmignore` excludes sensitive files and development configs.

   **Critical exclusions:**

   - `.env`
   - `.sb-config.json` (local config with keys)
   - `src/`
   - `.husky/`

4. **Publish:**

   ```bash
   npm publish --access public
   ```

   Note: The package is scoped as `@startblock-ai/cli`.

## Coding Standards

- **TypeScript:** We use strict TypeScript mode.
- **Formatting:** Please ensure your code is formatted before committing.
- **UI/UX:** We use `boxen` and `chalk` for a polished terminal experience. All user-facing messages should be clear and helpful.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
