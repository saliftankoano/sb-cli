# 🚀 Startblock CLI

> **Automatic knowledge capture for codebases. Capture the "WHY" behind your code before it's lost.**

[![npm version](https://img.shields.io/npm/v/@startblock-ai/cli.svg?style=flat-square)](https://www.npmjs.com/package/@startblock-ai/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Stop losing context when developers leave or switch projects.**
`sb-cli` integrates directly into your git workflow to automatically document your code changes, capture developer insights, and maintain a living knowledge base.

---

## ✨ Why Startblock?

- **🧠 Never Lose Context Again:** Automatically generate documentation for every file you touch.
- **⚡ Zero Friction:** Runs as a git hook. No context switching, no separate apps.
- **💬 Capture Insights:** An optional, quick prompt asks for your "gotchas" and "tricky choices" right when they're fresh in your mind.
- **📁 Mirrored Structure:** Knowledge files live right alongside your code in `.startblock/knowledge/`, mirroring your project structure.
- **🤖 AI-Powered:** Uses OpenAI to analyze code changes, dependencies, and purpose automatically.

---

## 📦 Installation

Install the CLI globally using npm:

```bash
npm install -g @startblock-ai/cli
```

> **Note:** If you encounter permission errors, check our [**Installation Guide**](./INSTALL.md).

### Verify Installation

```bash
sb --help
sb --version  # Check installed version
```

---

## 🚀 Quick Start

Get up and running in seconds.

### For New Repositories

1.  **Clone and install:**

    ```bash
    git clone your-repo
    cd your-repo
    npm install
    ```

    _If the repo has Startblock configured, onboarding runs automatically after `npm install`!_

2.  **Or initialize manually:**

    ```bash
    cd your-project
    sb init
    ```

    _This sets up the git hooks and prompts you for your OpenAI API key._

### For Existing Repositories

1.  **Run onboarding:**

    ```bash
    sb onboard
    ```

    _This analyzes key files and generates onboarding documentation._

2.  **Commit code as usual:**

    ```bash
    git add .
    git commit -m "feat: added payment retry logic"
    ```

3.  **That's it!**
    - The CLI will analyze your changes.
    - It will ask if you want to add any insights (optional).
    - Your knowledge files are generated and committed automatically! 🎉

---

## 🛠️ How It Works

### Automatic Onboarding

When you clone a repository with Startblock enabled and run `npm install`, the `postinstall` script automatically invites you to run `sb onboard`. This:

1.  **Collects your goals** - What are you trying to accomplish? What's your experience level?
2.  **AI selects best files** - Intelligently chooses ~5 files most relevant to your goal
3.  **Analyzes and documents** - Generates knowledge files for those selected files
4.  **Creates onboarding docs** - Living documentation in `.startblock/onboarding/` (INDEX.md, SETUP.md, ARCHITECTURE.md, etc.)
5.  **Saves session** - Stores your onboarding context in `.startblock/sessions/` (never committed)
6.  **Continue in Cursor** - Use Startblock's MCP in Cursor chat for personalized, conversational onboarding

**The onboarding experience:**

- **CLI**: Run `sb onboard` to get started with personalized file selection and analysis
- **Cursor Chat**: Continue onboarding conversationally - Startblock uses your session data to guide you through the codebase
- **Living Docs**: Onboarding docs evolve as you learn - they're never overwritten, only refined

### Commit-Time Analysis

1.  **You Commit**: `git commit -m "..."`
2.  **Analysis**: AI scans your staged files to understand purpose and dependencies.
3.  **Context**: You see a summary of what's changing.
4.  **Insight (Optional)**: "Any gotchas or tricky choices?" -> You type a quick note.
5.  **Generation**: AI combines its analysis with your notes to create detailed markdown docs.
6.  **Done**: The docs are staged and committed with your code.

**Ideally suited for:**

- Teams with high turnover or rapid scaling.
- Complex codebases with "hidden knowledge".
- "Lazy" developers who hate writing documentation manually (we got you!).

---

### 🖥️ Visual Onboarding Server

Want a more interactive experience? Startblock includes a built-in visual server that turns your knowledge files into a rich, animated dashboard.

1.  **Run Server:**
    ```bash
    sb serve
    ```
    _Starts a local server at http://localhost:3939_

2.  **Features:**
    -   **Interactive File Tree:** Explore your project structure with knowledge status indicators.
    -   **Voice Narration:** AI guide walks you through file purpose and insights (powered by OpenAI TTS).
    -   **Dynamic UI:** Smooth animations, expandable dossiers, and "Dynamic Island" player controls.
    -   **Dark Mode:** Optimized for developers with a sleek, high-contrast theme.

## 📋 Commands

- `sb init` - Initialize Startblock in current repository
- `sb onboard` - Run personalized onboarding (collects your goals, AI-selects files, generates docs)
- `sb onboard --postinstall` - Non-blocking onboarding invitation after npm install (used automatically)
- `sb serve` - Start the visual onboarding server (interactive web UI)
- `sb analyze-commit` - Analyze staged files (used by Husky hook)
- `sb setup-onboarding` - Configure automatic onboarding for maintainers (adds postinstall script)
- `sb --version` or `sb -v` - Show CLI version
- `sb --help` or `sb -h` - Show help message

**Onboarding Flow:**

1. Run `sb onboard` - Answer a few questions about your goals and experience
2. CLI analyzes AI-selected files and generates knowledge docs
3. Continue in Cursor chat - Startblock's MCP uses your session to guide personalized onboarding
4. Docs evolve - Onboarding documentation improves with each session

## ⚙️ Configuration

After running `sb init`, you can customize behavior in `.sb-config.json`:

```json
{
  "openai": {
    "apiKey": "sk-...", // Your OpenAI Key
    "model": "gpt-4o-mini", // Recommend gpt-4o for best results
    "temperature": 0.3
  },
  "analysis": {
    "excludePatterns": ["*.test.ts", "dist/**"],
    "maxFilesPerAnalysis": 10
  },
  "livekit": {
    "url": "wss://your-project.livekit.cloud",
    "apiKey": "AP...",
    "apiSecret": "your-secret-here"
  }
}
```

> 🔒 **Security**: Your API keys are stored locally in `.sb-config.json` which is automatically added to `.gitignore`.

### Voice Onboarding Setup

To enable voice-first onboarding with LiveKit:

1. **Get LiveKit Cloud credentials** (free tier available):
   - Sign up at https://cloud.livekit.io
   - Create a project and get API credentials

2. **Add to `.sb-config.json`** (see example above)

3. **Set up the agent**:
   ```bash
   cd agent
   pip install -r requirements.txt
   export LIVEKIT_URL="wss://your-project.livekit.cloud"
   export LIVEKIT_API_KEY="AP..."
   export LIVEKIT_API_SECRET="your-secret"
   export OPENAI_API_KEY="sk-..."
   export REPO_ROOT="/path/to/repo"
   python main.py dev
   ```

4. **Start the server**: `sb serve`

See [LIVEKIT_SETUP.md](./LIVEKIT_SETUP.md) for detailed setup instructions.

---

## 📚 Resources

- [**Installation Troubleshooting**](./INSTALL.md): Fix permission issues.
- [**Testing Guide**](./TESTING_GUIDE.md): Step-by-step walkthrough for newcomers.
- [**Contributing**](./CONTRIBUTING.md): Want to build `sb-cli`? Start here.

---

## License

MIT © [Startblock](https://startblock.ai)
