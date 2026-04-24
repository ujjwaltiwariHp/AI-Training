# Training Data Guide

## Connecting to Backend Data

The frontend relies on two modes of generating responses:

1. **Direct Mode (Anthropic):** Hits Anthropic directly via `/api/chat`. No special training data is used here unless system prompts are provided dynamically in the UI.
2. **FAQ Mode (Build 02 Backend):** Hits `build-02-faq-chatbot` running on `localhost:3002`. This backend uses `src/data/faq.json` for domain-specific knowledge and `faq-system.md` for conversational guardrails.

To enrich or refine responses, make sure you configure your data in the respective backend folders.
