# Deploying the Onboarding Agent

This guide explains how to deploy the Voice Onboarding Agent so users can connect without needing your local machine or personal API keys.

## Prerequisites

- **LiveKit Cloud Project**: URL, API Key, and Secret.
- **OpenAI API Key**.
- **Hosting Platform**: Railway, Fly.io, or any Docker-compatible host.

## Docker Deployment

We have included a `Dockerfile` to containerize the agent.

### 1. Build the Image

```bash
cd sb-cli/agent
docker build -t onboarding-agent .
```

### 2. Run Locally (Testing)

You need to mount the repository you want to onboard users onto. For example, to onboard onto the current repo:

```bash
docker run -it \
  -e LIVEKIT_URL="wss://..." \
  -e LIVEKIT_API_KEY="AP..." \
  -e LIVEKIT_API_SECRET="..." \
  -e OPENAI_API_KEY="sk-..." \
  -v $(pwd)/../../:/app/repo \
  onboarding-agent python main.py dev
```

> Note: We map `$(pwd)/../../` (the repo root) to `/app/repo` inside the container.

### 3. Deploy to Production (e.g. Railway)

1. **Push this code** to your git repository.
2. **Create a new Service** in Railway from the repo.
3. **Set Root Directory** to `sb-cli/agent`.
4. **Configure Environment Variables**:
   - `LIVEKIT_URL`
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `OPENAI_API_KEY`
   - `REPO_ROOT`: Set this to `/app/repo` (or wherever you put the code).

**Important**: The agent needs access to the code it is explaining.

- If you are deploying via Docker, you must **COPY** the target repository into the image or clone it at runtime.
- For a self-contained "Onboard to Startblock" agent, modify the `Dockerfile` to COPY the `startblock` code into `/app/repo`.

Example modification to `Dockerfile` for a specific repo:

```dockerfile
# ... (after COPY . .)

# Copy the actual code to be explained
COPY ../.. /app/repo
```

## Running the CLI Script

You were previously trying to run `python3 run.sh` which caused a syntax error. `run.sh` is a Bash script.

**Correct usage:**

```bash
./run.sh
# OR
bash run.sh
```
