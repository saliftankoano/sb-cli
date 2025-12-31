FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# git is required for reading git history/config if needed
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set default env vars
ENV REPO_ROOT=/app/repo

# Create a volume point for the repo
VOLUME /app/repo

# Start the agent
# Use "start" for production deployment (connects to LiveKit Cloud)
CMD ["python", "main.py", "start"]

