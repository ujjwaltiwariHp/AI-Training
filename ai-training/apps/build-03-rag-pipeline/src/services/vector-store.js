import { ChromaClient } from 'chromadb'

const client = new ChromaClient({ path: process.env.CHROMA_URL || 'http://localhost:8000' })

export async function getOrCreateCollection(name) {
  return await client.getOrCreateCollection({
    name,
    metadata: { 'hnsw:space': 'cosine' }
  })
}

export async function upsertChunks(collectionName, chunks, embeddings, ids) {
  const collection = await getOrCreateCollection(collectionName)
  await collection.upsert({
    ids,
    embeddings,
    documents: chunks.map(c => c.text),
    metadatas: chunks.map(c => c.metadata)
  })
}

export async function queryChunks(collectionName, queryEmbedding, topK = 5) {
  const collection = await getOrCreateCollection(collectionName)
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK
  })

  // results.documents could be empty if no chunks exist
  if (!results.documents || results.documents.length === 0 || results.documents[0].length === 0) return []

  return results.documents[0].map((text, i) => ({
    text,
    metadata: results.metadatas[0][i],
    score: 1 - results.distances[0][i]
  }))
}

export async function deleteDocument(collectionName, sourceFilename) {
  const collection = await getOrCreateCollection(collectionName)
  await collection.delete({ where: { source: sourceFilename } })
}

export async function checkHealth() {
  try {
    const alive = await client.heartbeat()
    return { status: 'connected', latency: alive ? 'ok' : 'error' }
  } catch(e) {
    return { status: 'disconnected', error: String(e) }
  }
}
