# API Testing Guide - Build 1

This guide contains everything you need to test the Streaming LLM API functionality.

## 🚀 Getting Started

Ensure your development server is running on `http://localhost:3001` and Redis is active.

### 1. Health & Dependency Check
Verify that the server and Redis connection are healthy.

```bash
curl http://localhost:3001/health | jq
```

---

## 💬 Chat & Streaming Tests

The chat endpoint uses **Server-Sent Events (SSE)**. Use `curl -N` to see the stream.

### A. Basic Streaming (Auto-Fallback)
Test the default behavior (Gemini -> OpenAI -> Anthropic).

```bash
curl -N -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Explain quantum computing in one sentence."
  }'
```

### B. Specific Provider Test
Force the use of a specific provider.

```bash
curl -N -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Hello!",
    "provider": "gemini"
  }'
```

---

## 📚 History & Persistence

The server remembers conversation context via Redis.

### 1. Fetch History
Retrieve the messages stored for a session.

```bash
curl http://localhost:3001/api/chat/test-123/history | jq
```

### 2. Clear History
Delete all messages for a specific session.

```bash
curl -X DELETE http://localhost:3001/api/chat/test-123
```

---

## 🔍 Troubleshooting & Debugging

If you see `data: {"type":"error", ...}` in the response, it means all providers failed. The error message will now include specific details from each provider (e.g., `gemini: 429 Too Many Requests`).

### 1. Test Gemini Key Directly (Direct Google API)
Use this to verify if your Gemini key has quota available without the server's overhead.

```bash
# Export your key first
export GEMINI_API_KEY="your-key-here"

# Direct cURL to Google API
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=$GEMINI_API_KEY \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{ "contents": [{ "parts": [{ "text": "Hi" }] }] }'
```

### 2. Common Errors
- **429 Too Many Requests:** Your Google AI Studio quota (Free Tier) is reached. Wait 1 minute and try again.
- **401 Unauthorized:** Your API key in `.env` is invalid or contains a typo.
- **Empty SSE Stream:** Check the server logs using `docker compose logs -f` or in the terminal where `pnpm dev` is running.
