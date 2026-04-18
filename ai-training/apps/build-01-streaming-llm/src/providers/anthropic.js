// src/providers/anthropic.js
import Anthropic from '@anthropic-ai/sdk'
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
    this.client = new Anthropic({ apiKey })
  }
 
  async *streamChat({ messages, systemPrompt, maxTokens = 1000, correlationId, signal }) {
    try {
      // NOTE: Anthropic system prompt is top-level, NOT inside messages array
      const params = {
        model: this.model,
        max_tokens: maxTokens,   // REQUIRED — 400 error without it
        messages,
        stream: true
      }
      if (systemPrompt) params.system = systemPrompt
 
      const stream = await this.client.messages.create(params, {
        signal
      })
 
      let inputTokens = 0
      let outputTokens = 0
 
      for await (const event of stream) {
        if (signal?.aborted) break
        
        if (event.type === 'content_block_delta') {
          const token = event.delta?.text
          if (token) yield { type: 'token', content: token }
        }
        if (event.type === 'message_delta' && event.usage) {
          outputTokens = event.usage.output_tokens
        }
        if (event.type === 'message_start' && event.message?.usage) {
          inputTokens = event.message.usage.input_tokens
        }
      }
 
      yield {
        type: 'done',
        usage: { 
          inputTokens, 
          outputTokens, 
          model: this.model, 
          provider: this.name,
          cost: this.calculateCost(inputTokens, outputTokens) 
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || signal?.aborted) return
      throw err
    }
  }
 
  calculateCost(inputTokens, outputTokens) {
    const p = PRICING[this.model] || PRICING['claude-3-5-haiku-20241022']
    return ((inputTokens * p.input) + (outputTokens * p.output)) / 1_000_000
  }
}
