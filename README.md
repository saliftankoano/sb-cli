# sb-cli

Automatic knowledge capture for codebases via Husky hooks and OpenAI.

## Overview

`sb-cli` automatically offboards developer knowledge on every git commit. When you commit code, OpenAI analyzes the changed files and generates/updates knowledge documentation in `.startblock/knowledge/` with a mirrored directory structure that matches your source code.

## Installation

```bash
npm install -g @startblock-ai/cli
```

**Having permission issues?** See our [**Installation Guide**](./INSTALL.md) for detailed setup instructions.

**Quick fix for permission errors:**

```bash
# Configure npm to use local directory (no sudo needed)
mkdir -p ~/.npm-global && npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc  # or open a new terminal
npm install -g @startblock-ai/cli
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

**Update to latest version:**

```bash
npm install -g @startblock-ai/cli@latest
```

Or simply:

```bash
npm update -g @startblock-ai/cli
```

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

1. **`sb init`** sets up Husky pre-commit hook and prompts for your OpenAI API key
2. **You commit** as usual: `git commit -m "your message"`
3. **AI analyzes** your staged files automatically
4. **Commit context** displayed in a styled box (commit message shown as "Preparing commit..." since it's not available yet in pre-commit hook)
5. **Opt-in prompt**: "Want to add your insights? [y/N]"
6. **One open-ended question** (if you opt in): Share gotchas, tricky choices, or surprises for future devs
7. **AI enhances** relevant knowledge files with your insights woven in naturally
8. **Confirm commit**: Final check before committing everything together
9. **Done!** 🚀 Knowledge files auto-staged and committed with your code

**The magic:** Captures the **WHY** behind your code, not just the **WHAT**! 🧠

### What Makes It Great for "Lazy Devs"

- ✨ **Opt-in**: Skip the Q&A if you're in a rush (just hit Enter)
- 🎯 **One question**: No lengthy interviews, just one brain dump
- 💬 **Natural input**: Type freely, press Enter for new lines, submit with 2 empty lines
- 🔒 **Your words stay sacred**: No sanitization or rephrasing - your informal language is preserved exactly
- 🎨 **Beautiful UI**: Styled boxes with purple/blue colors for a pleasant experience
- ⚡ **Non-blocking**: Works seamlessly in Git hooks with proper TTY handling

## Commands

### `sb init`

Initialize Startblock in your repository. Sets up:

- Husky `pre-commit` hook (runs early enough to generate and stage knowledge files with your code)
- `.sb-config.json` with your OpenAI API key (gitignored)
- `.sb-config.example.json` template for your team (committable)
- `.startblock/` directory structure

### `sb analyze-commit`

Called automatically by the Git hook. You typically don't run this directly, but you can for testing.

### `sb sim-intro`

Preview the animated ASCII art intro (for development/testing).

### `sb --help`

Show available commands and usage.

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

## Knowledge File Organization

Knowledge files are stored in `.startblock/knowledge/` with a mirrored directory structure:

```
your-project/
├── src/
│   ├── utils/
│   │   └── helper.ts
│   └── core/
│       └── analyzer.ts
└── .startblock/
    └── knowledge/
        └── src/
            ├── utils/
            │   └── helper.ts.md
            └── core/
                └── analyzer.ts.md
```

This makes it easy to:

- 🔍 Find knowledge files that correspond to source files
- 📁 Navigate knowledge docs the same way you navigate code
- 🤝 Keep knowledge organized as your codebase grows

Each knowledge file includes:

- **AI-generated analysis**: Purpose, dependencies, key functions
- **Your insights**: Gotchas, tricky choices, and context AI can't infer
- **Metadata**: File version, last updated, tags, importance level

## Troubleshooting

- **Permission errors during install**: See [INSTALL.md](./INSTALL.md)
- **Hook not running**: Make sure `.husky/pre-commit` exists and is executable
- **API key issues**: Check `.sb-config.json` exists in your repo root with valid key
- **Want to test the full flow?**: See [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## License

MIT
