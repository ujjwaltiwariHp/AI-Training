# Build 2: FAQ Chatbot

This project demonstrates a Prompt Engineering-based AI chatbot built with Fastify, Anthropic (Claude), and Redis.

## Features
- Context injection via a `.md` system prompt.
- 4 Layers of Guardrails: Rate limiting, string validations, payload injection check and PII masking.
- Conversation tracked via Redis caching.
- SSE Stream usage.

## Setup
- Start dependencies from root `docker compose up -d redis`.

## Test
Test with cURL:
```bash
curl -X POST http://localhost:3002/api/faq/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I upgrade my plan?","sessionId":"test-session-1"}' --no-buffer
```
