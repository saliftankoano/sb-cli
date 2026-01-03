# Deploying Startblock (Agent + UI)

This guide explains how to deploy both the **Voice Agent** (which joins rooms) and the **Web UI** (which generates tokens and hosts the frontend).

## Architecture

To allow users to access Startblock without keys, you need two services running:

1.  **Frontend Service (`sb serve`)**: Hosts the web UI and generates LiveKit tokens.
2.  **Agent Service**: Runs the Python agent that joins the LiveKit rooms.

Both services must share the **exact same** LiveKit credentials.

---

## Part 1: Deploying the Frontend (`sb serve`)

This service runs the Node.js CLI in server mode.

### 1. Deployment (Railway)

1.  Push the `sb-cli` code to your git repository.
2.  Create a new Service in Railway from the repo.
3.  Set Root Directory to `sb-cli`.ie
4.  Railway will automatically detect the `Dockerfile` we added.

### 2. Environment Variables

Configure these in the Railway dashboard for the frontend service:

| Variable             | Value                                   |
| -------------------- | --------------------------------------- |
| `LIVEKIT_URL`        | `wss://your-project.livekit.cloud`      |
| `LIVEKIT_API_KEY`    | Your LiveKit API key                    |
| `LIVEKIT_API_SECRET` | Your LiveKit API secret                 |
| `OPENAI_API_KEY`     | OpenAI API key (for narration features) |
| `PORT`               | (Railway sets this automatically)       |
| `REPO_ROOT`          | `/app/repo` (see below)                 |

### 3. Mounting the Repo

The server needs access to the knowledge files (`.startblock/knowledge`) to serve them to the UI.

**Option A: Bake it in (Easiest)**
Modify `sb-cli/Dockerfile` to copy your target repo:

```dockerfile
# Add this before the CMD line
COPY ../startblock /app/repo
ENV REPO_ROOT=/app/repo
```

**Option B: Clone at runtime**
Use a startup script to `git clone` your target repo into `/app/repo`.

---

## Part 2: Deploying the Agent

This service runs the Python agent that actually speaks.

### 1. Deployment (Railway)

1.  Create another Service in Railway from the same repo.
2.  Set Root Directory to `sb-cli/agent`.
3.  Railway will detect the `Dockerfile` in the agent directory.

### 2. Environment Variables

| Variable             | Value                                       |
| -------------------- | ------------------------------------------- |
| `LIVEKIT_URL`        | **MUST MATCH FRONTEND**                     |
| `LIVEKIT_API_KEY`    | **MUST MATCH FRONTEND**                     |
| `LIVEKIT_API_SECRET` | **MUST MATCH FRONTEND**                     |
| `OPENAI_API_KEY`     | OpenAI API key                              |
| `REPO_ROOT`          | `/app/repo` (Same repo content as frontend) |

### 3. Mounting the Repo

The agent needs the **same repo files** as the frontend to answer questions about them.
Ensure you copy/mount the repo into `/app/repo` in the agent's Dockerfile as well.

---

## Part 3: Testing

1.  Visit the **Frontend Service URL** (e.g., `https://sb-cli-production.up.railway.app`).
2.  Click "Start".
3.  The frontend generates a token (using server-side keys).
4.  You join the room.
5.  The **Agent Service** detects the room and joins.
6.  Voice conversation starts! 🎙️
