# Testing Guide for Frontend Build 02

## Prerequisites
1. Docker and Docker Compose installed
2. Valid `ANTHROPIC_API_KEY` in `apps/frontend-build-02/.env.local`
3. Monorepo dependencies installed

## Local Verification
1. From the project root, start all services: `docker compose up --build`
2. Open `http://localhost:3004`
3. Try standard mode by querying something generic. Check model badge for usage.
4. Try FAQ mode by toggling the badge in the header. Ask a question that exists in `faq.json` (e.g., "remote work policy" or "health insurance").
5. The UI stream should feel fast and format code cleanly.
6. Verify cost calculations update on stream completion.
