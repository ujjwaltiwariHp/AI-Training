import { chunkByStructure } from '../services/chunker.js'
import { embedTexts, embedQuery } from '../services/embedder.js'
import { upsertChunks, deleteDocument } from '../services/vector-store.js'
import { ragQuery } from '../services/rag-service.js'
import { langchainQuery } from '../services/langchain/lc-query.js'
import { langchainIngest } from '../services/langchain/lc-ingest.js'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function ragRoutes(fastify) {
  fastify.post('/api/rag/ingest', async (req, reply) => {
    const { text, filename, impl } = req.body
    if (!text || !filename) return reply.code(400).send({ error: 'text and filename required' })
    if (text.trim() === '') return reply.code(400).send({ error: 'Document appears to be empty or unreadable' })

    try {
        await deleteDocument('hr-policy', filename)

        if (impl === 'langchain') {
            const chunkCount = await langchainIngest(text, filename)
            return { message: 'Ingested successfully via Langchain', chunkCount }
        } else {
            const chunks = chunkByStructure(text, filename)
            req.log.info({ chunkCount: chunks.length, filename }, 'Chunked document')

            const texts = chunks.map(c => c.text)
            const embeddings = await embedTexts(texts)

            const ids = chunks.map((c, i) => `${filename}-chunk-${i}`)
            await upsertChunks('hr-policy', chunks, embeddings, ids)

            return { message: 'Ingested successfully via Raw API', chunkCount: chunks.length }
        }
    } catch(e) {
        req.log.error(e)
        return reply.code(503).send({ error: "Failed to process document, possibly due to ChromaDB down", details: String(e) })
    }
  })

  fastify.post('/api/rag/chat', async (req, reply) => {
    const impl = req.query.impl || 'raw'
    const { question } = req.body
    if (!question) return reply.code(400).send({ error: 'question is required' })

    try {
        let chunks, messages;
        if (impl === 'langchain') {
             const result = await langchainQuery(question, 'hr-policy')
             chunks = result.chunks
             messages = result.messages
        } else {
             const result = await ragQuery(question, 'hr-policy')
             chunks = result.chunks
             messages = result.messages
        }

        reply.raw.setHeader('Content-Type', 'text/event-stream')
        reply.raw.setHeader('Cache-Control', 'no-cache')
        reply.raw.setHeader('Connection', 'keep-alive')

        const stream = await anthropic.messages.stream({
            model: 'claude-haiku-4-5',
            max_tokens: 1000,
            system: 'You are an HR policy assistant. Answer ONLY from the provided context sections. Always cite the source section name. If the answer is not in the context, say: "I could not find this in the HR policy document."',
            messages
        })

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                reply.raw.write(`data: ${JSON.stringify({ type: 'token', content: chunk.delta.text })}\n\n`)
            }
        }

        const finalMsg = await stream.finalMessage()
        const inputTokens = finalMsg.usage.input_tokens
        const outputTokens = finalMsg.usage.output_tokens

        reply.raw.write(`data: ${JSON.stringify({ type: 'sources', chunks })}\n\n`)
        reply.raw.write(`data: ${JSON.stringify({ type: 'done', usage: { inputTokens, outputTokens } })}\n\n`)
        reply.raw.end()
    } catch (e) {
        req.log.error(e)
        if (!reply.raw.headersSent) {
            return reply.code(500).send({ error: "Failed to process chat" })
        } else {
             reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: 'Failed' })}\n\n`)
             reply.raw.end()
        }
    }
  })

  fastify.delete('/api/rag/documents/:docId', async (req, reply) => {
    try {
        await deleteDocument('hr-policy', req.params.docId)
        return { message: 'Document deleted' }
    } catch(e) {
         return reply.code(500).send({ error: 'Failed to delete' })
    }
  })
}
