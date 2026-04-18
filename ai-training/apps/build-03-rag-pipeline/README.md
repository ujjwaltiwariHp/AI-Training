# Build 3: RAG Pipeline

This project implements a Retrieval-Augmented Generation (RAG) pipeline for HR documents.

## Design Patterns & Implementations
It supports both direct raw API querying against ChromaDB vector stores, and an identical LangChain logic abstraction route.

## Setup
Start ChromaDB using `docker compose up -d chromadb`.
Start Redis using `docker compose up -d redis`.

## Usage
Upload a file.
```bash
curl -X POST http://localhost:3003/api/rag/ingest \
  -H "Content-Type: application/json" \
  -d '{"filename": "hr-policy.txt", "text": "## Leave Policy\nEmployees are entitled to 20 days annual leave..."}'
```

Query the LLM.
```bash
curl -X POST http://localhost:3003/api/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How many days of annual leave do employees get?"}' \
  --no-buffer
```

Query using Langchain Implementation via query params `?impl=langchain`.
```bash
curl -X POST "http://localhost:3003/api/rag/chat?impl=langchain" \
  -H "Content-Type: application/json" \
  -d '{"question": "How many days of annual leave do employees get?"}' \
  --no-buffer
```
