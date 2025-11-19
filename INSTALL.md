# Installation Guide

## Quick Install

```bash
npm install -g @startblock-ai/cli
```

## Avoiding Permission Issues

If you encounter `EACCES` or permission errors, configure npm to use a local directory:

### One-Time Setup (Recommended)

```bash
# Create local npm directory
mkdir -p ~/.npm-global

# Configure npm to use it
npm config set prefix '~/.npm-global'

# Add to PATH (choose your shell)
# For zsh (macOS default):
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# For bash:
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Then Install

```bash
npm install -g @startblock-ai/cli
```

## Verify Installation

```bash
sb --help
```

You should see the StartBlock CLI help with ASCII art! 🎨

## Update to Latest Version

When a new version is published to npm, update your global installation:

```bash
npm install -g @startblock-ai/cli@latest
```

Or use the shorter command:

```bash
npm update -g @startblock-ai/cli
```

**Check your current version:**

```bash
npm list -g @startblock-ai/cli
```

## Troubleshooting

### Command Not Found

If `sb` command is not found after installation:

1. **Reload your shell:**

   ```bash
   source ~/.zshrc  # or source ~/.bashrc
   ```

   Or open a new terminal window.

2. **Check your PATH:**

   ```bash
   echo $PATH | grep npm-global
   ```

   Should show: `/Users/yourname/.npm-global/bin`

3. **Use full path temporarily:**
   ```bash
   ~/.npm-global/bin/sb --help
   ```

### Permission Denied

If you see permission errors:

- **Don't use sudo!** Instead, follow the "Avoiding Permission Issues" section above.
- This ensures all npm packages install to your user directory.

## Development Install

For contributors working from source:

```bash
git clone https://github.com/startblock/sb-cli.git
cd sb-cli
npm install
npm run build
npm link
```

Make sure you've configured npm prefix (see above) to avoid permission issues.
