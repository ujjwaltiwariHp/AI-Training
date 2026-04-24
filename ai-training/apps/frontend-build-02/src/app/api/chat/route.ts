import Anthropic from '@anthropic-ai/sdk'
import { calculateCost } from '@/lib/models'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { messages, model, systemPrompt, mode, sessionId } = await req.json()
    
    if (mode === 'faq') {
       // Proxy to the build-02 FAQ backend which returns an SSE stream
       const faqBackend = process.env.FAQ_BACKEND_URL || 'http://localhost:3002'
       const lastUserMessage = messages[messages.length - 1]?.content

       const response = await fetch(`${faqBackend}/api/faq/chat`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
               message: lastUserMessage,
               sessionId: sessionId || 'default'
           })
       })

       if (!response.ok) {
           throw new Error('Failed to reach FAQ backend')
       }
       
       return new Response(response.body, {
           headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
           }
       })
    }

    // Direct mode - hitting Anthropic
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
    const targetModel = model || 'claude-haiku-4-5'

    const stream = await client.messages.stream({
      model: targetModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
            for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                controller.enqueue(
                new TextEncoder().encode(
                    `data: ${JSON.stringify({ type: 'token', content: chunk.delta.text })}\n\n`
                )
                )
            }
            }
            const final = await stream.finalMessage()
            controller.enqueue(
            new TextEncoder().encode(
                `data: ${JSON.stringify({
                type: 'done',
                usage: {
                    inputTokens: final.usage.input_tokens,
                    outputTokens: final.usage.output_tokens,
                    model: targetModel,
                    cost: calculateCost(targetModel, final.usage.input_tokens, final.usage.output_tokens)
                }
                })}\n\n`
            )
            )
            controller.close()
        } catch (e: any) {
             controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', message: e.message })}\n\n`)
             )
             controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (err: any) {
    return new Response(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`, {
       headers: { 'Content-Type': 'text/event-stream' }
    })
  }
}
