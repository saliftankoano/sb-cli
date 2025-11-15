# Testing Guide for Startblock CLI

This guide walks you through testing the Startblock CLI as a newcomer.

## Prerequisites

- Node.js v18+ installed
- OpenAI API key
- A git repository to test with (can be a new empty repo)

---

## Step 1: Install the CLI Globally

### For Development (from source):

If you're developing or testing from the `sb-cli` repository:

```bash
cd /path/to/sb-cli
npm install
npm run build
npm link
```

**If you get permission errors**, configure npm to avoid sudo:

```bash
# Set npm to use a local directory (no sudo needed)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to your PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc  # or open a new terminal

# Now link
npm link
```

### For Production Use:

```bash
npm install -g @startblock/cli
```

**Verify installation:**

```bash
sb --help
```

You should see:

```
sb-cli - Automatic knowledge capture for codebases

Usage:
  sb init            Initialize Startblock in current repo
  sb analyze-commit  Analyze staged files (used by Husky hook)
  sb --help          Show this help message
```

**Troubleshooting:** If `sb` command is not found:

- Make sure you ran `source ~/.zshrc` (or open a new terminal)
- Check your PATH: `echo $PATH | grep npm-global`
- Try the full path: `~/.npm-global/bin/sb --help`

---

## Step 2: Create a Test Repository

Create a new test repository or use an existing one:

```bash
# Option A: Create a new test repo
mkdir ~/sb-test-repo
cd ~/sb-test-repo
git init
npm init -y

# Option B: Use an existing repo
cd /path/to/your/existing/repo
```

---

## Step 3: Initialize Startblock

```bash
sb init
```

This will:

- ✅ Create `.startblock/knowledge/` directory
- ✅ Create `.sb-config.json` configuration file
- ✅ Install and configure Husky
- ✅ Set up pre-commit hook
- ✅ Update `.gitignore`

**Output should look like:**

```
╔════════════════════════════════╗
║        StartBlock CLI          ║
╚════════════════════════════════╝

  🚀 Dev Onboarding in hours, not months!

✓ Created .startblock/knowledge directory
✓ Created .sb-config.json with your API key
✓ Created .sb-config.example.json (safe to commit)
✓ Installed Husky
✓ Initialized Husky
✓ Created pre-commit hook
✓ Updated .gitignore

✨ Initialization complete! ✨

You're all set! Next steps:
  1. Commit some code:
     git add . && git commit -m "feat: new feature"
  2. Answer a few questions about your changes
  3. Knowledge is automatically captured! 🎉
```

---

## Step 4: Add Your OpenAI API Key

During `sb init`, you were prompted for your OpenAI API key. If you entered it, you're all set! ✅

**The CLI will:**

- Save your API key securely in `.sb-config.json`
- Automatically add `.sb-config.json` to `.gitignore` (your key stays private!)
- Create `.sb-config.example.json` for your team (safe to commit)

If you **skipped it** or want to change it later:

```bash
# Open .sb-config.json in your favorite editor
nano .sb-config.json
# or
code .sb-config.json
```

**Find the `apiKey` field and replace it with your actual key:**

```json
{
  "openai": {
    "apiKey": "sk-proj-abc123xyz...your-real-key", // ← Put your key here
    "model": "gpt-4o-mini"
    // ...
  }
}
```

**Get your API key at:** https://platform.openai.com/api-keys

**Security:** `.sb-config.json` is automatically added to `.gitignore`, so your key is safe! 🔒  
**Sharing with your team:** Use `.sb-config.example.json` (safe to commit) as a template.

---

## Step 5: Create Some Test Code

Create a simple file to test with:

```bash
cat > src/utils.ts << 'EOF'
/**
 * Utility functions for the application
 */

export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
EOF
```

---

## Step 6: Stage Your Changes

```bash
git add src/utils.ts
```

---

## Step 7: Commit (This Triggers the Magic! ✨)

```bash
git commit -m "feat: add utility functions"
```

**What happens next:**

### 1️⃣ **Initial Analysis**

```
Analyzing staged files...
Scanning repository...
Building dependency graph...
Analyzing src/utils.ts (1/1)...
```

### 2️⃣ **OpenAI Analysis Complete**

```
✓ Initial analysis complete for src/utils.ts
Now let's capture your unique insights about this file...
```

### 3️⃣ **Interactive Q&A (One Question at a Time)**

The CLI will ask you questions about your code. **This works seamlessly in Git hooks** - you'll get the full interactive experience even during commits!

```
What is the main purpose of src/utils.ts?
> This file contains common utility functions used across the app
[Press Enter to submit]

What gotchas or non-obvious behaviors should developers know about?
> The email validation is basic and doesn't cover all edge cases
[Press Enter to submit]

How does this file fit into the larger system? What are the critical dependencies?
> Used by the authentication and user profile modules
[Press Enter to submit]

Why did you create this file? What problem does it solve?
> Centralized common string operations to avoid duplication
[Press Enter to submit]
```

**How it works:**

- Type your answer
- Press **Enter** to submit and move to the next question
- The CLI uses `readline-sync` to ensure reliable input handling in Git hooks
- Your answers are combined with AI analysis to create comprehensive knowledge docs

**Pro tip:** You can skip any question by just pressing Enter without typing anything!

### 4️⃣ **Review & Confirm**

```
📚 Knowledge Documentation Summary:

  • src/utils.ts

✅ Ready to finalize and commit this knowledge? (yes/no)
> yes
```

### 5️⃣ **Knowledge Generated & Staged**

```
Writing knowledge files...
✓ 1 knowledge file(s) ready to commit!

📚 1 knowledge file(s) staged for commit
You can now complete your commit! 🚀
```

### 6️⃣ **Commit Completes**

```
[main abc1234] feat: add utility functions
 2 files changed, 50 insertions(+)
 create mode 100644 src/utils.ts
 create mode 100644 .startblock/knowledge/src/utils.md
```

---

## Step 8: View the Generated Knowledge

```bash
cat .startblock/knowledge/src/utils.md
```

You'll see a markdown file with:

- **Metadata** (YAML frontmatter with file version, language, importance)
- **Purpose** (from OpenAI analysis)
- **Key Concepts** (technical details)
- **Dependencies** (imports and relationships)
- **Developer Notes** (YOUR insights from the Q&A!)

---

## 🎯 Testing Different Scenarios

### Test 1: Modify an Existing File

```bash
echo "export const PI = 3.14159;" >> src/utils.ts
git add src/utils.ts
git commit -m "feat: add PI constant"
```

**Expected:** You'll be asked about the _changes_ you made.

### Test 2: Create a New File with Dependencies

```bash
cat > src/auth.ts << 'EOF'
import { validateEmail } from './utils';

export function loginUser(email: string): boolean {
  if (!validateEmail(email)) {
    return false;
  }
  // ... authentication logic
  return true;
}
EOF

git add src/auth.ts
git commit -m "feat: add authentication"
```

**Expected:** The dependency graph will detect the import from `utils.ts`.

### Test 3: Skip the Analysis (abort commit)

```bash
echo "console.log('test');" >> src/utils.ts
git add src/utils.ts
git commit -m "test: temporary change"
```

When asked "Ready to finalize?", type `no`.

**Expected:** Commit will be aborted.

---

## 🔧 Configuration

Edit `.sb-config.json` to customize:

```json
{
  "openai": {
    "model": "gpt-4o", // Use GPT-4 for better analysis
    "temperature": 0.2, // Lower = more deterministic
    "maxTokens": 3000 // Longer knowledge docs
  },
  "analysis": {
    "maxFilesPerAnalysis": 5, // Analyze fewer files per commit
    "excludePatterns": [
      "*.test.ts", // Ignore test files
      "dist/**" // Ignore build output
    ]
  }
}
```

---

## 🐛 Troubleshooting

### Problem: `sb: command not found`

**Solution:** Run `npm link` again from the sb-cli directory.

### Problem: `Error: OpenAI API key not configured`

**Solution:** Edit `.sb-config.json` in your project root:

```json
{
  "openai": {
    "apiKey": "sk-your-actual-key" // ← Add your key here
    // ...
  }
}
```

### Problem: Hook doesn't run on commit

**Solution:** Check that `.husky/pre-commit` exists and is executable:

```bash
ls -la .husky/pre-commit
chmod +x .husky/pre-commit
```

### Problem: Want to skip analysis for one commit

**Solution:** Use `--no-verify` flag:

```bash
git commit -m "chore: quick fix" --no-verify
```

### Problem: Interactive Q&A not working / questions not appearing

**Solution:** The CLI uses `readline-sync` to ensure reliable input handling in Git hooks. If questions aren't appearing:

1. **Make sure you're committing from a terminal** (not a GUI Git client)
2. **Check that stdin is connected:** The hook should work automatically when running `git commit` from terminal
3. **If questions don't appear:** The CLI will fall back to AI-only analysis and continue with the commit

**Note:** The interactive Q&A works seamlessly in Git hooks thanks to `readline-sync`, which handles non-TTY stdin properly. You should see questions appear automatically when you commit!

---

## 🎉 Success!

You've now:

- ✅ Installed Startblock CLI
- ✅ Initialized it in a repo
- ✅ Captured tacit knowledge on commit
- ✅ Generated beautiful knowledge documentation

Every commit now automatically captures **WHY** you built what you built - knowledge that would otherwise be lost! 🧠

---

## Next Steps

1. **Share with your team:** They can install via `npm install -g @startblock/cli`
2. **Customize prompts:** Edit `src/prompts/templates.ts` to ask different questions
3. **Fine-tune models:** Train custom models on your repo's knowledge base (coming soon!)

Happy documenting! 📚✨
