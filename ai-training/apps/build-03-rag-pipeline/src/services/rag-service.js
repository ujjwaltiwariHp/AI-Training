import Anthropic from '@anthropic-ai/sdk'
import { embedQuery } from './embedder.js'
import { queryChunks } from './vector-store.js'

export async function ragQuery(question, collectionName = 'hr-policy') {
  const queryEmbedding = await embedQuery(question)
  const chunks = await queryChunks(collectionName, queryEmbedding, 5)

  if (chunks.length === 0) {
      return { chunks: [], messages: [{ role: 'user', content: `Context from HR Policy:\n\nNone found\n\n---\n\nQuestion: ${question}`}]}
  }

  const context = chunks
    .map((c, i) => `[${i + 1}] Section: ${c.metadata.section} (Page ${c.metadata.page})\n${c.text}`)
    .join('\n\n---\n\n')

  const messages = [{
    role: 'user',
    content: `Context from HR Policy:\n\n${context}\n\n---\n\nQuestion: ${question}`
  }]

  return { chunks, messages }
}
