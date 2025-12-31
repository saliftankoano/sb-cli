# Agent Setup & Usage Guide

This directory contains the Startblock Voice Agent, which provides interactive voice onboarding for repositories.

## Scripts Overview

- `setup.sh`: Creates a Python virtual environment and installs dependencies.
- `run.sh`: Activates the environment, loads configuration, and starts the agent.

## 1. Setup

Run the setup script once to prepare the environment:

```bash
cd agent
./setup.sh
```

This will:

1. Create a `venv` directory (Python virtual environment).
2. Upgrade `pip`.
3. Install all required packages from `requirements.txt`.

## 2. Configuration

The agent needs LiveKit and OpenAI credentials. It looks for a `.sb-config.json` file in the **target repository root**.

Ensure your repository has `.sb-config.json`:

```json
{
  "livekit": {
    "url": "wss://your-project.livekit.cloud",
    "apiKey": "API_KEY...",
    "apiSecret": "SECRET..."
  },
  "openai": {
    "apiKey": "sk-..."
  }
}
```

## 3. Running the Agent

Use `run.sh` to start the agent. You must specify the path to the repository you want to onboard users onto.

### Usage

```bash
./run.sh [PATH_TO_REPO]
```

### Examples

**If you are inside `sb-cli/agent` and want to onboard onto `sb-cli` (parent dir):**

```bash
./run.sh ..
```

**If you want to onboard onto a different project:**

```bash
./run.sh /Users/username/projects/my-other-app
```

**If you run it without arguments, it defaults to the CURRENT directory:**

```bash
./run.sh  # Will look for .sb-config.json in ./agent/ (likely incorrect)
```

## Troubleshooting

- **"LiveKit credentials not found"**: This usually means you ran `./run.sh` without arguments, so it looked in `agent/` instead of your repo root. Run `./run.sh ..` or provide the full path.
- **"Virtual environment not found"**: You skipped Step 1. Run `./setup.sh`.
