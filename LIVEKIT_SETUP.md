# LiveKit Setup Guide

To enable voice-first onboarding, you need to configure LiveKit Cloud credentials.

## Step 1: Get LiveKit Cloud Credentials

1. **Sign up for LiveKit Cloud** (if you haven't already):
   - Go to https://cloud.livekit.io
   - Sign up for a free account (includes free tier)

2. **Create a Project**:
   - After logging in, create a new project
   - Note your project's **URL** (e.g., `wss://your-project.livekit.cloud`)

3. **Get API Credentials**:
   - Go to your project settings
   - Navigate to "API Keys" section
   - Create a new API key (or use an existing one)
   - Copy:
     - **API Key** (starts with `AP...`)
     - **API Secret** (long string)

## Step 2: Configure in Your Project

You have two options:

### Option A: Environment Variables (Recommended for Production)

Set these environment variables:

```bash
export LIVEKIT_URL="wss://your-project.livekit.cloud"
export LIVEKIT_API_KEY="AP..."
export LIVEKIT_API_SECRET="your-secret-here"
```

### Option B: Config File (Recommended for Development)

Add to your `.sb-config.json`:

```json
{
  "livekit": {
    "url": "wss://your-project.livekit.cloud",
    "apiKey": "AP...",
    "apiSecret": "your-secret-here"
  }
}
```

> **Note**: `.sb-config.json` is already in `.gitignore`, so your secrets are safe.

## Step 3: Set Up the Agent

The agent needs to run separately. You'll need:

1. **Python environment** with the agent dependencies:
   ```bash
   cd agent
   pip install -r requirements.txt
   ```

2. **Environment variables for the agent**:
   ```bash
   export LIVEKIT_URL="wss://your-project.livekit.cloud"
   export LIVEKIT_API_KEY="AP..."
   export LIVEKIT_API_SECRET="your-secret-here"
   export OPENAI_API_KEY="sk-..."  # Same as your .sb-config.json
   export REPO_ROOT="/path/to/your/repo"  # Path to the repo being onboarded
   ```

3. **Run the agent**:
   ```bash
   python agent/main.py dev
   ```

## Step 4: Test It

1. Start the onboarding server:
   ```bash
   sb serve
   ```

2. Open http://localhost:3939 in your browser

3. The UI should connect to LiveKit and show the voice interface

## Troubleshooting

**"LiveKit configuration missing" error:**
- Make sure you've set the credentials in either `.sb-config.json` or environment variables
- Restart the server after adding config

**Agent not connecting:**
- Check that the agent is running
- Verify LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are set correctly
- Check agent logs for connection errors

**No voice in browser:**
- Check browser console for errors
- Make sure microphone permissions are granted
- Verify LiveKit room is being created (check LiveKit Cloud dashboard)

## What You Need Summary

| Credential | Where to Get It | Where to Put It |
|------------|----------------|-----------------|
| **LiveKit URL** | LiveKit Cloud project settings | `.sb-config.json` or `LIVEKIT_URL` env var |
| **LiveKit API Key** | LiveKit Cloud API Keys section | `.sb-config.json` or `LIVEKIT_API_KEY` env var |
| **LiveKit API Secret** | LiveKit Cloud API Keys section | `.sb-config.json` or `LIVEKIT_API_SECRET` env var |
| **OpenAI API Key** | platform.openai.com/api-keys | `.sb-config.json` or `OPENAI_API_KEY` env var (already configured) |

## Next Steps

Once configured:
1. Run `sb onboard` to create a session
2. Start the server: `sb serve`
3. Start the agent: `python agent/main.py dev`
4. Open the browser and start talking! 🎙️
