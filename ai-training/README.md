# 🤖 AI Training — Full-Stack AI Engineering Bootcamp

A progressive, hands-on monorepo for learning AI engineering from the ground up — from server foundations to production-grade AI agents.

Built with **Turborepo** + **pnpm workspaces** for a real-world monorepo experience.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture & Monorepo Explained](#-architecture--monorepo-explained)
- [Prerequisites](#-prerequisites)
- [Setup (First Time)](#-setup-first-time)
- [Running the Project](#-running-the-project)
  - [Development Mode (Recommended)](#-development-mode-recommended)
  - [Production Mode (Docker)](#-production-mode-docker)
  - [Running Individual Apps](#-running-individual-apps)
- [Available Scripts](#-available-scripts)
- [Docker & Redis Commands](#-docker--redis-commands)
- [Environment Variables](#-environment-variables)
- [Tech Stack](#-tech-stack)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

This monorepo contains a **10-build progressive curriculum** for AI engineering, starting from backend foundations and advancing to production AI agents:

| App | Name | Description | Status |
|-----|------|-------------|--------|
| `day0-foundation` | **Foundation Server** | Fastify API with Redis, JWT auth, structured logging, CORS, rate limiting | ✅ Active |
| `build-01-streaming-llm` | **Streaming LLM** | Real-time token streaming from OpenAI/Anthropic | 📋 Planned |
| `build-02-faq-chatbot` | **FAQ Chatbot** | Conversational chatbot with context management | 📋 Planned |
| `build-03-rag-pipeline` | **RAG Pipeline** | Retrieval-Augmented Generation with vector search | 📋 Planned |
| `build-04-advanced-rag` | **Advanced RAG** | Hybrid search, re-ranking, and evaluation | 📋 Planned |
| `build-05-ai-agent` | **AI Agent** | Autonomous agent with tool calling | 📋 Planned |
| `build-06-mcp-server` | **MCP Server** | Model Context Protocol server implementation | 📋 Planned |
| `build-07-automation-pipeline` | **Automation** | Multi-step AI automation workflows | 📋 Planned |
| `build-08-n8n-workflow` | **n8n Workflow** | Visual workflow automation with n8n | 📋 Planned |
| `build-09-text-to-sql` | **Text to SQL** | Natural language to SQL query generation | 📋 Planned |
| `build-10-graduation` | **Graduation** | Capstone project combining all skills | 📋 Planned |

---

## 🏗 Architecture & Monorepo Explained

### What is a Monorepo?

A **monorepo** is a single Git repository that holds multiple related projects (apps, libraries, services). Instead of having 10+ separate repositories, everything lives under one roof.

**Benefits:**
- 📦 **Shared code** — Common utilities/configs are written once, used everywhere
- 🔄 **Atomic changes** — Update a shared library and all apps that depend on it in one commit
- 🧪 **Unified tooling** — One set of lint/test/build configurations
- 📋 **Single dependency tree** — No version conflicts between projects

### Turborepo

[Turborepo](https://turbo.build/repo) is the **task runner** that orchestrates builds across the monorepo. It knows the dependency graph between packages and can:
- Run tasks in parallel across all apps
- Cache build outputs (skip re-building unchanged code)
- Filter to run tasks for specific apps only

### pnpm Workspaces

[pnpm](https://pnpm.io/) is the **package manager**. Its workspace feature links all apps/packages together so they can import from each other without publishing to npm.

### Directory Structure

```
AI-Training/
└── ai-training/                        ← Monorepo root
    ├── README.md                       ← You are here
    ├── package.json                    ← Root scripts & Turborepo dependency
    ├── pnpm-workspace.yaml             ← Declares workspace packages
    ├── pnpm-lock.yaml                  ← Locked dependency versions
    ├── turbo.json                      ← Turborepo task configuration
    ├── docker-compose.yml              ← Docker services (Redis + apps)
    ├── .gitignore                      ← Git ignore rules
    │
    ├── apps/                           ← 🚀 Application packages
    │   ├── day0-foundation/            ← Foundation Fastify server
    │   │   ├── Dockerfile              ← Docker build instructions
    │   │   ├── .dockerignore           ← Files excluded from Docker build
    │   │   ├── .env                    ← Local environment variables (git-ignored)
    │   │   ├── .env.example            ← Template for .env
    │   │   ├── package.json            ← App dependencies & scripts
    │   │   └── src/
    │   │       ├── server.js           ← Entry point — Fastify setup & startup
    │   │       ├── config.js           ← Environment variable loading & validation
    │   │       ├── plugins/
    │   │       │   ├── logger.js       ← Pino logger (pretty in dev, JSON in prod)
    │   │       │   └── redis.js        ← Redis connection with retry strategy
    │   │       ├── middleware/
    │   │       │   └── correlation-id.js  ← Request tracing via X-Correlation-ID
    │   │       ├── routes/
    │   │       │   └── health.js       ← GET /health endpoint with Redis check
    │   │       └── utils/              ← Shared utility functions
    │   │
    │   ├── build-01-streaming-llm/     ← (Upcoming builds)
    │   ├── build-02-faq-chatbot/
    │   ├── build-03-rag-pipeline/
    │   ├── build-04-advanced-rag/
    │   ├── build-05-ai-agent/
    │   ├── build-06-mcp-server/
    │   ├── build-07-automation-pipeline/
    │   ├── build-08-n8n-workflow/
    │   ├── build-09-text-to-sql/
    │   └── build-10-graduation/
    │
    └── packages/                       ← 📚 Shared library packages
        ├── config/                     ← Shared configuration utilities
        ├── errors/                     ← Shared error classes
        ├── logger/                     ← Shared logger setup
        └── redis-client/               ← Shared Redis client wrapper
```

### How It All Connects

```
┌─────────────────────────────────────────────────────────────┐
│                     pnpm-workspace.yaml                     │
│              Declares: apps/* and packages/*                │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
       ┌───────▼───────┐          ┌───────▼───────┐
       │    apps/*      │          │  packages/*   │
       │  (runnable)    │─imports─▶│  (libraries)  │
       │                │          │               │
       │  day0-foundation│         │  config/      │
       │  build-01-...  │          │  errors/      │
       │  build-02-...  │          │  logger/      │
       └───────┬───────┘          │  redis-client/ │
               │                   └───────────────┘
               │
       ┌───────▼────────┐
       │   turbo.json    │
       │  Orchestrates   │
       │  dev/build/test │
       └────────────────┘
```

---

## ✅ Prerequisites

Ensure the following are installed on your system:

| Tool | Minimum Version | Install Guide | Verify |
|------|----------------|---------------|--------|
| **Node.js** | ≥ 20.x | [nodejs.org](https://nodejs.org/) or `nvm install 20` | `node -v` |
| **pnpm** | ≥ 8.x | `npm install -g pnpm` | `pnpm -v` |
| **Docker** | Latest | [docs.docker.com](https://docs.docker.com/get-docker/) | `docker -v` |
| **Docker Compose** | v2+ (included with Docker Desktop) | Comes with Docker Desktop | `docker compose version` |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | `git --version` |

---

## 🚀 Setup (First Time)

### 1. Clone the repository

```bash
git clone <your-repo-url> AI-Training
cd AI-Training/ai-training
```

### 2. Install all dependencies

```bash
pnpm install
```

> This installs dependencies for **all** apps and packages in the monorepo at once, thanks to pnpm workspaces.

### 3. Set up environment variables

```bash
# Copy the example .env file
cp apps/day0-foundation/.env.example apps/day0-foundation/.env
```

Edit `apps/day0-foundation/.env` and fill in your values:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

REDIS_URL=redis://localhost:6379

JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars

OPENAI_API_KEY=sk-your-actual-key-here
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

CORS_ORIGINS=http://localhost:3000
```

### 4. Pull the Redis Docker image

```bash
docker compose pull redis
```

### 5. Verify setup

```bash
# Start Redis
docker compose up -d redis

# Start the foundation app
pnpm dev:day0

# In another terminal, test the health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 5,
  "dependencies": {
    "redis": { "status": "connected", "latency": "2ms", "ok": true }
  },
  "version": "1.0.0"
}
```

---

## 🏃 Running the Project

### 🛠 Development Mode (Recommended)

Best for **daily coding** — includes hot-reload (auto-restart on file save, like `nodemon`).

```bash
# Terminal 1: Start Redis in background
docker compose up -d redis

# Terminal 2: Start the app with hot-reload
pnpm dev:day0
```

**What happens:**

| Component | Runs On | Hot Reload? |
|-----------|---------|-------------|
| Your app (Fastify) | Your machine (bare metal) | ✅ Yes — `node --watch` restarts on save |
| Redis | Docker container (background) | N/A |

**Stop:**
```bash
# Ctrl+C in Terminal 2 to stop the app
# Then stop Redis:
docker compose down
```

---

### 🐳 Production Mode (Docker)

Runs **everything** inside Docker containers. Simulates production.

```bash
# Build and start all services
docker compose up --build

# Or run in background (detached)
docker compose up --build -d
```

**What happens:**

| Component | Runs On | Hot Reload? |
|-----------|---------|-------------|
| Your app (Fastify) | Docker container | ❌ No — must rebuild |
| Redis | Docker container | N/A |

> ⚠️ **No hot-reload in Docker mode.** Every code change requires `docker compose up --build` again. Use this only to test your production build.

**Stop:**
```bash
# If running in foreground: Ctrl+C (press once, wait 3 seconds)

# If running in background:
docker compose down

# Stop and delete all data (Redis volume):
docker compose down -v
```

---

### 🎯 Running Individual Apps

#### Run a specific app

```bash
# Run only day0-foundation
pnpm dev:day0

# This is shorthand for:
# turbo run dev --filter=day0-foundation
```

#### Run all apps at once

```bash
# Runs dev for ALL apps in the monorepo (in parallel)
pnpm dev
```

#### Run from the app directory itself

```bash
cd apps/day0-foundation
pnpm dev        # Same result, just runs this app
```

---

## 📜 Available Scripts

### Root-Level Commands (run from `ai-training/`)

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies for all apps and packages |
| `pnpm dev` | Start **all** apps in development mode (parallel) |
| `pnpm dev:day0` | Start **only** `day0-foundation` in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all apps and packages |
| `pnpm test` | Run tests for all apps and packages |

### App-Level Commands (run from `apps/day0-foundation/`)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start with hot-reload (`node --watch`) |
| `pnpm start` | Start without hot-reload (production) |
| `pnpm lint` | Lint the source code |

### Turborepo Filter Syntax

```bash
# Run dev for a specific app
turbo run dev --filter=day0-foundation

# Run build for all apps that depend on a package
turbo run build --filter=...@ai/config

# Run dev for all apps matching a pattern
turbo run dev --filter="build-*"
```

---

## 🐳 Docker & Redis Commands

### Docker Compose — Service Management

| Command | Description |
|---------|-------------|
| `docker compose up -d redis` | Start **only Redis** in background |
| `docker compose up --build` | Build and start **all services** (foreground) |
| `docker compose up --build -d` | Build and start **all services** (background) |
| `docker compose down` | Stop all services |
| `docker compose down -v` | Stop all services **and delete data volumes** |
| `docker compose restart redis` | Restart Redis |
| `docker compose ps` | Show running services and their status |
| `docker compose logs` | Show logs from all services |
| `docker compose logs -f redis` | Follow Redis logs in real-time |
| `docker compose logs -f day0-foundation` | Follow app logs in real-time |

### Docker Container Management

| Command | Description |
|---------|-------------|
| `docker ps` | List all running containers |
| `docker ps -a` | List all containers (including stopped) |
| `docker stats` | Live CPU/RAM usage of all containers |
| `docker exec -it ai-training-redis-1 redis-cli` | Open Redis CLI inside the container |
| `docker exec -it ai-training-redis-1 redis-cli PING` | Test Redis connection (should return `PONG`) |

### Docker Image Management

| Command | Description |
|---------|-------------|
| `docker images` | List all local images |
| `docker compose build day0-foundation` | Build only the app image |
| `docker image prune -f` | Delete unused/dangling images |
| `docker system prune -f` | Clean up everything unused (images, containers, networks) |
| `docker system df` | Show Docker disk usage |

### Sharing Docker Images

```bash
# Export image as a .tar file (to share offline)
docker compose build day0-foundation
docker save -o day0-foundation.tar ai-training-day0-foundation:latest

# Compress for smaller file size
gzip day0-foundation.tar
# Creates: day0-foundation.tar.gz

# Import on another machine
docker load -i day0-foundation.tar
# Or: gunzip -c day0-foundation.tar.gz | docker load

# Push to Docker Hub (to share online)
docker login
docker tag ai-training-day0-foundation:latest YOUR_USERNAME/day0-foundation:latest
docker push YOUR_USERNAME/day0-foundation:latest
```

### Redis CLI Commands

```bash
# Connect to Redis CLI
docker exec -it ai-training-redis-1 redis-cli

# Inside Redis CLI:
PING                  # Test connection → PONG
INFO server           # Server information
DBSIZE                # Number of keys in database
KEYS *                # List all keys (use cautiously in production)
FLUSHALL              # Delete all data (development only!)
QUIT                  # Exit Redis CLI
```

---

## 🔐 Environment Variables

### `apps/day0-foundation/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `development` (pretty logs) or `production` (JSON logs) |
| `LOG_LEVEL` | No | `debug` | Log level: `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| `REDIS_URL` | **Yes** | — | Redis connection string. Use `redis://localhost:6379` for local dev |
| `JWT_SECRET` | **Yes** | — | Secret for JWT token signing (min 32 characters) |
| `OPENAI_API_KEY` | **Yes** | — | OpenAI API key (starts with `sk-`) |
| `ANTHROPIC_API_KEY` | **Yes** | — | Anthropic API key (starts with `sk-ant-`) |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated allowed origins |

### Docker Compose Environment Overrides

When running via `docker compose up`, these values from `docker-compose.yml` **override** the `.env` file:

```yaml
environment:
  - REDIS_URL=redis://redis:6379    # Uses Docker internal DNS, NOT localhost
  - NODE_ENV=production             # Forces production mode
```

> ⚠️ `REDIS_URL` is different between local dev and Docker:
> - **Local dev:** `redis://localhost:6379` (your machine talks to Docker container)
> - **Docker Compose:** `redis://redis:6379` (container talks to container via Docker DNS)

---

## 🧰 Tech Stack

### Runtime & Framework
| Technology | Purpose |
|-----------|---------|
| [Node.js 20](https://nodejs.org/) | JavaScript runtime |
| [Fastify](https://fastify.dev/) | High-performance web framework (3x faster than Express) |
| [pnpm](https://pnpm.io/) | Fast, disk-efficient package manager |
| [Turborepo](https://turbo.build/) | Monorepo build orchestrator |

### Data & Caching
| Technology | Purpose |
|-----------|---------|
| [Redis](https://redis.io/) | In-memory cache, session store, rate limiting backend |
| [ioredis](https://github.com/redis/ioredis) | Redis client for Node.js with auto-reconnect |

### Security & Middleware
| Technology | Purpose |
|-----------|---------|
| [@fastify/jwt](https://github.com/fastify/fastify-jwt) | JWT authentication |
| [@fastify/helmet](https://github.com/fastify/fastify-helmet) | Security headers |
| [@fastify/cors](https://github.com/fastify/fastify-cors) | Cross-Origin Resource Sharing |
| [@fastify/rate-limit](https://github.com/fastify/fastify-rate-limit) | API rate limiting |
| [Correlation ID](https://www.rapid7.com/blog/post/2016/12/23/the-value-of-correlation-ids/) | Request tracing via `X-Correlation-ID` header |

### Logging & Validation
| Technology | Purpose |
|-----------|---------|
| [Pino](https://getpino.io/) | Ultra-fast JSON logger |
| [pino-pretty](https://github.com/pinojs/pino-pretty) | Human-readable dev logs |
| [Zod](https://zod.dev/) | TypeScript-first schema validation |

### DevOps & Containerization
| Technology | Purpose |
|-----------|---------|
| [Docker](https://www.docker.com/) | Containerization |
| [Docker Compose](https://docs.docker.com/compose/) | Multi-container orchestration |
| Alpine Linux | Minimal base image for containers |

---

## 🔧 Troubleshooting

### ❌ `connect ECONNREFUSED 127.0.0.1:6379`

**Redis is not running.** Start it:
```bash
docker compose up -d redis
```

### ❌ `Missing required env var: REDIS_URL`

Your `.env` file is missing or not loaded:
```bash
cp apps/day0-foundation/.env.example apps/day0-foundation/.env
# Then edit it with your values
```

### ❌ Port 3000 already in use

```bash
# Find and kill the process using port 3000
sudo lsof -i :3000
sudo kill -9 <PID>
```

### ❌ Port 6379 already in use

```bash
# Find what's using Redis port
sudo lsof -i :6379
sudo kill -9 <PID>
# Or stop the existing Docker container:
docker ps
docker stop <container-name>
```

### ❌ `ELIFECYCLE Command failed` on Ctrl+C

This is **normal**. When you press Ctrl+C:
1. Node.js receives `SIGINT`
2. Your graceful shutdown handler runs
3. The process exits with code 0
4. pnpm reports the "failure" because the process exited (not a real error)

### ❌ `Connection is closed` error on shutdown

**Harmless.** The app tries to gracefully close Redis (`redis.quit()`) but Redis connection is already closed. Safe to ignore.

### ❌ Docker image errors like `focused_carver`

You accidentally ran an image from Docker Desktop's **Run** button. Never do this — always use `docker compose up` from the terminal. Clean up:
```bash
docker rm -f <container-name>
```

### 🧹 Nuclear Reset (start fresh)

```bash
# Stop everything
docker compose down -v

# Delete all Docker resources
docker system prune -af --volumes

# Reinstall Node dependencies
rm -rf node_modules apps/*/node_modules
pnpm install

# Start fresh
docker compose up -d redis
pnpm dev:day0
```

---

## 📖 API Endpoints

### Day 0 — Foundation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check with Redis status |

**Example:**
```bash
curl http://localhost:3000/health | jq
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 120,
  "dependencies": {
    "redis": {
      "status": "connected",
      "latency": "2ms",
      "ok": true
    }
  },
  "version": "1.0.0"
}
```

---

## 🤝 Contributing

1. Create your feature branch: `git checkout -b feature/my-feature`
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev:day0`
4. Make your changes (hot-reload will pick them up)
5. Test your changes: `pnpm test`
6. Lint your code: `pnpm lint`
7. Commit: `git commit -m 'feat: add my feature'`
8. Push: `git push origin feature/my-feature`

---

## 📄 License

This project is private and used for AI engineering training purposes.
