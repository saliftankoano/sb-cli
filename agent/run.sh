#!/bin/bash
# Helper script to run the LiveKit agent
# Usage: ./run.sh /path/to/repo/to/onboard

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
REPO_ROOT="${1:-$(pwd)}"

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
  echo "❌ Virtual environment not found!"
  echo "Run ./setup.sh first to create it."
  exit 1
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Load config from .sb-config.json if it exists in the repo root
if [ -f "$REPO_ROOT/.sb-config.json" ]; then
  echo "📋 Loading config from $REPO_ROOT/.sb-config.json"
  export LIVEKIT_URL=$(node -e "console.log(require('$REPO_ROOT/.sb-config.json').livekit?.url || '')")
  export LIVEKIT_API_KEY=$(node -e "console.log(require('$REPO_ROOT/.sb-config.json').livekit?.apiKey || '')")
  export LIVEKIT_API_SECRET=$(node -e "console.log(require('$REPO_ROOT/.sb-config.json').livekit?.apiSecret || '')")
  export OPENAI_API_KEY=$(node -e "console.log(require('$REPO_ROOT/.sb-config.json').openai?.apiKey || '')")
fi

# Set REPO_ROOT
export REPO_ROOT

# Check if all required env vars are set
if [ -z "$LIVEKIT_URL" ] || [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ]; then
  echo "❌ Error: LiveKit credentials not found!"
  echo "Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET"
  echo "Or add them to $REPO_ROOT/.sb-config.json"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Error: OPENAI_API_KEY not found!"
  exit 1
fi

echo "🚀 Starting LiveKit agent..."
echo "📁 Repo root: $REPO_ROOT"
echo "🌐 LiveKit URL: $LIVEKIT_URL"
echo ""

# Run the agent
python "$SCRIPT_DIR/main.py" dev

