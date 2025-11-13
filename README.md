# sb-cli

Automatic knowledge capture for codebases via Husky hooks and OpenAI.

## Overview

`sb-cli` automatically offboards developer knowledge on every git commit. When you commit code, OpenAI analyzes the changed files and generates/updates knowledge documentation in `.startblock/knowledge/` format.

## Installation

```bash
npm install -g @startblock/cli
```

## Quick Start

```bash
# Initialize in your repository
cd your-project
sb init

# Commit code - knowledge is captured automatically!
git add .
git commit -m "feat: new feature"
```

## How It Works

1. `sb init` sets up Husky pre-commit hooks
2. On every commit, changed files are automatically analyzed
3. OpenAI generates knowledge documentation
4. Knowledge files are auto-staged and committed

## Configuration

Create `.sb-config.json` in your project root:

```json
{
  "openai": {
    "apiKey": "${OPENAI_API_KEY}",
    "model": "gpt-4o-mini",
    "temperature": 0.3
  },
  "analysis": {
    "excludePatterns": ["node_modules/**", "dist/**"],
    "fileExtensions": [".ts", ".js", ".tsx", ".jsx", ".py"],
    "maxFilesPerAnalysis": 10
  }
}
```

Or set via environment variable:

```bash
export OPENAI_API_KEY=sk-...
```

## License

MIT
