import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'

export async function langchainIngest(text, filename) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  })

  const rawDocs = await splitter.createDocuments([text])
  
  const docs = rawDocs.map((doc, i) => {
      doc.metadata = { source: filename, chunk_id: `${filename}-chunk-${i}` }
      return doc
  })

  const ids = docs.map((_, i) => `${filename}-chunk-${i}`)

  await Chroma.fromDocuments(
    docs,
    new OpenAIEmbeddings({ model: 'text-embedding-3-small' }),
    {
      collectionName: 'hr-policy',
      url: process.env.CHROMA_URL || 'http://localhost:8000',
      ids
    }
  )

  return docs.length
}
