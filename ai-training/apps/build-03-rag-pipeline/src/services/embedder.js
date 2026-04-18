import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function embedTexts(texts) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts
  })
  return response.data.map(d => d.embedding)
}

export async function embedQuery(query) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  })
  return response.data[0].embedding
}
