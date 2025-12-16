# LiveKit Setup Guide

## Default Configuration (Testing Phase)

For the current testing phase, **you do not need to configure LiveKit credentials manually**. The CLI comes pre-configured with a default LiveKit project provided by Startblock.

You can skip directly to setting up the agent.

## Custom Configuration (Optional)

If you prefer to use your own LiveKit Cloud project (e.g., for production or private development), you can override the defaults.

### Option A: Environment Variables

```bash
export LIVEKIT_URL="wss://your-project.livekit.cloud"
export LIVEKIT_API_KEY="AP..."
export LIVEKIT_API_SECRET="your-secret-here"
```

### Option B: Config File

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

## Running the Agent

To enable voice interaction, you still need to run the Python agent:

1. **Install dependencies**:
   ```bash
   cd agent
   pip install -r requirements.txt
   ```

2. **Run the agent**:
   ```bash
   # If using default keys:
   export OPENAI_API_KEY="sk-..."
   export REPO_ROOT="/path/to/your/repo"
   python agent/main.py dev

   # If using custom keys, export them first as shown above.
   ```
