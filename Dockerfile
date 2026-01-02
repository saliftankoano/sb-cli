FROM node:20-slim
WORKDIR /app

# Install deps for both CLI and UI
COPY package*.json ./
COPY ui/package*.json ./ui/
RUN npm ci
RUN cd ui && npm ci

# Copy source and build
COPY . .
RUN npm run build

# Default port (Railway sets $PORT)
ENV PORT=3000

# Start the serve command
# Note: For production use with a specific repo, you should:
# 1. Mount the repo volume to /app/repo OR
# 2. Copy the repo files into /app/repo
# 3. Set REPO_ROOT=/app/repo
CMD ["node", "dist/index.js", "serve", "--no-open"]

