# sb-cli

Automatic knowledge capture for codebases via Husky hooks and OpenAI.

## Overview

`sb-cli` automatically offboards developer knowledge on every git commit. When you commit code, OpenAI analyzes the changed files and generates/updates knowledge documentation in `.startblock/knowledge/` format.

## Installation

```bash
npm install -g @startblock/cli
```

**Having permission issues?** See our [**Installation Guide**](./INSTALL.md) for detailed setup instructions.

**Quick fix for permission errors:**

```bash
# Configure npm to use local directory (no sudo needed)
mkdir -p ~/.npm-global && npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc  # or open a new terminal
npm install -g @startblock/cli
```

### Option 2: Development Install (for contributors)

```bash
git clone https://github.com/startblock/sb-cli.git
cd sb-cli
npm install
npm link  # Links locally for development
```

**Verify installation:**

```bash
sb --help
```

You should see the StartBlock CLI help message with ASCII art! 🎨

> 📖 **Need detailed installation help?** Check out [INSTALL.md](./INSTALL.md) for troubleshooting and setup instructions.

## Quick Start

**Want to test it as a newcomer?** 👉 See our [**Complete Testing Guide**](./TESTING_GUIDE.md)

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
2. On every commit, changed files are automatically analyzed by OpenAI
3. **Interactive Q&A:** You answer questions about your changes (one at a time) - **works seamlessly in Git hooks!**
4. Knowledge files are generated with both AI insights and your tacit knowledge
5. Review, confirm, and knowledge files are auto-staged and committed

**The magic:** Captures the **WHY** behind your code, not just the **WHAT**! 🧠

### Interactive Q&A Flow

When you commit, you'll be asked questions like:

- "What is the main purpose of this file?"
- "What gotchas or non-obvious behaviors should developers know about?"
- "How does this file fit into the larger system?"

**Answer each question and press Enter**

## Configuration

After running `sb init`, you'll have two config files:

### `.sb-config.json` (your local settings with API key)

```json
{
  "openai": {
    "apiKey": "sk-your-key-here", // Set during init or add manually
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

Get your API key at: https://platform.openai.com/api-keys

**Security:** This file is automatically added to `.gitignore`. 🔒

### `.sb-config.example.json` (template for your team)

Same structure but without your API key. **Safe to commit!** Team members copy this to `.sb-config.json` and add their own keys.

## License

MIT
