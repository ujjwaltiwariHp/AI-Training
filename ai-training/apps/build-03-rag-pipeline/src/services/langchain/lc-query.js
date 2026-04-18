import { OpenAIEmbeddings } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'

export async function langchainQuery(question, collectionName = 'hr-policy') {
    const vectorStore = new Chroma(
      new OpenAIEmbeddings({ model: 'text-embedding-3-small' }),
      {
        collectionName,
        url: process.env.CHROMA_URL || 'http://localhost:8000',
      }
    )
  
    const results = await vectorStore.similaritySearchWithScore(question, 5)

    const chunks = results.map(([doc, score]) => ({
      text: doc.pageContent,
      metadata: doc.metadata,
      score: score
    }))

    const contextStr = chunks
    .map((c, i) => `[${i + 1}] Source: ${c.metadata.source}\n${c.text}`)
    .join('\n\n---\n\n')

    const messages = [{
        role: 'user',
        content: `Context from HR Policy:\n\n${contextStr}\n\n---\n\nQuestion: ${question}`
    }]
  
    return { chunks, messages }
}
