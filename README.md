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
```

---

## 🚀 Quick Start

Get up and running in seconds.

1.  **Initialize in your repository:**

    ```bash
    cd your-project
    sb init
    ```

    _This sets up the git hooks and prompts you for your OpenAI API key._

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
  }
}
```

> 🔒 **Security**: Your API key is stored locally in `.sb-config.json` which is automatically added to `.gitignore`.

---

## 📚 Resources

- [**Installation Troubleshooting**](./INSTALL.md): Fix permission issues.
- [**Testing Guide**](./TESTING_GUIDE.md): Step-by-step walkthrough for newcomers.
- [**Contributing**](./CONTRIBUTING.md): Want to build `sb-cli`? Start here.

---

## License

MIT © [Startblock](https://startblock.ai)
