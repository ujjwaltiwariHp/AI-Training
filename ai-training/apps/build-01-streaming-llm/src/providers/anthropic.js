// src/providers/anthropic.js
import { LLMProvider } from './base.js'
 
const PRICING = {
  'claude-3-5-sonnet-20241022': { input: 3.00,  output: 15.00 },
  'claude-3-5-haiku-20241022':   { input: 0.80,  output: 4.00 },
  'claude-3-haiku-20240307':    { input: 0.25,  output: 1.25 }
}
 
export class AnthropicProvider extends LLMProvider {
  constructor(apiKey) {
    super()
    this.name = 'anthropic'
    this.model = 'claude-3-5-haiku-20241022'
    this.apiKey = apiKey
    // If you have a specific gateway URL, set it in ANTHROPIC_BASE_URL
    this.baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1'
  }
 
  async *streamChat({ messages, systemPrompt, maxTokens = 1000, correlationId, signal }) {
    const body = {
      model: this.model,
      max_tokens: maxTokens,
      messages,
      stream: true
    }
    if (systemPrompt) body.system = systemPrompt

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-correlation-id': correlationId || ''
      },
      body: JSON.stringify(body),
      signal
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(`Anthropic API Error (${response.status}): ${JSON.stringify(errorData)}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue
          
          try {
            const data = JSON.parse(trimmed.slice(5))
            if (data.type === 'content_block_delta' && data.delta?.text) {
              yield { type: 'token', content: data.delta.text }
            }
            if (data.type === 'message_delta' && data.usage) {
              // usage info
            }
          } catch (e) {
            // ignore malformed lines
          }
        }
      }
      
      yield { type: 'done', usage: { model: this.model, provider: this.name } }
    } finally {
      reader.releaseLock()
    }
  }
}
