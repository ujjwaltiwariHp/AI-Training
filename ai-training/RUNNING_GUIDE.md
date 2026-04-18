# 🏃 AI Training — Running & Testing Guide

This guide provides clear instructions on how to run and test all modules in this monorepo, both in development mode (bare metal) and production-grade mode (Docker).

---

## 🛠 Prerequisites

Ensure these are installed and running:
- **Node.js**: ≥ 20.x
- **pnpm**: ≥ 8.x
- **Docker Desktop**: Running with the correct context.

---

## 🐳 Docker Troubleshooting (Connection Issues)

If you see `Cannot connect to the Docker daemon`:

1.  **Check Service**: Ensure Docker Desktop is running.
2.  **Fix Context**:
    ```bash
    docker context use desktop-linux
    ```
3.  **Verify Socket**:
    ```bash
    ls -la ~/.docker/desktop/docker.sock
    ```
4.  **Restart Daemon**:
    ```bash
    systemctl --user restart docker-desktop
    ```

---

## 🏗 General Monorepo Commands

Run these from the **root directory** (`ai-training/`):

| Command | Action |
|---------|--------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start **all** apps (parallel) |
| `pnpm build` | Build all apps for production |
| `pnpm test` | Run all tests |

---

## 📁 Build 0: Foundation Server

**Location:** `apps/day0-foundation`

### 1. Bare Metal (Development)
```bash
# Terminal 1: Start Redis
docker compose up -d redis

# Terminal 2: Start App
pnpm dev:day0
```

### 2. Docker (Production Simulation)
```bash
docker compose up --build day0-foundation
```

### 3. Verification
```bash
curl -s http://localhost:3000/health | jq
```

---

## 🚀 Build 1: Streaming LLM API

**Location:** `apps/build-01-streaming-llm`

### 1. Bare Metal (Development)
```bash
# 1. CD to app
cd apps/build-01-streaming-llm

# 2. Start Redis (from root or app if defined)
docker compose up -d redis

# 3. Start App
pnpm dev
```
> [!NOTE]
> If port 3000 is occupied, change `PORT` in `.env` to `3001`.

### 2. Docker (Isolated App + Redis)
```bash
cd apps/build-01-streaming-llm
docker compose up --build
```
This starts both the API (on port 3001) and an isolated Redis instance.

### 3. Testing the AI Providers

#### Test Gemini (The New Primary)
```bash
curl -N -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-gemini","message":"Explain RAG in one sentence.","provider":"gemini"}'
```

#### Test Fallback (OpenAI Error Simulation)
1. Set a fake `OPENAI_API_KEY=sk-fake` in `.env`.
2. Send a request with `"provider":"openai"`.
3. **Verify**: Check server logs for `warn: "Provider failed, trying next in fallback chain"`. Gemini should pick up the request automatically.

#### Test Persistence
```bash
# 1. Send first message
curl -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"sessionId":"s1","message":"My name is Ujjwal"}'

# 2. Check history
curl http://localhost:3001/api/chat/s1/history | jq
```

---

## 🤖 Build 2: FAQ Chatbot (Setup Only)

**Location:** `apps/build-02-faq-chatbot`

This build is currently in the **Prompt Engineering** phase. You can find the templates here:
- **FAQ Data**: `src/data/faq.json`
- **System Prompt**: `src/prompts/faq-system.md`

### To proceed with Build 2 code:
1. `cd apps/build-02-faq-chatbot`
2. Follow the Day 5 instructions to test these prompts directly against the OpenAI/Gemini APIs using `curl`.

---

## 🧹 Cleaning Up

```bash
# Stop all docker containers and remove volumes (nuclear reset)
docker compose down -v
```
