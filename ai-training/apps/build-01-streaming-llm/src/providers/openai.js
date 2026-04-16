// src/providers/openai.js
import OpenAI from 'openai'
import { LLMProvider } from './base.js'
 
// Pricing as of 2025 — verify at platform.openai.com/pricing
const PRICING = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },   // per 1M tokens
  'gpt-4o':      { input: 2.50, output: 10.00 },
}
 
export class OpenAIProvider extends LLMProvider {
  constructor(apiKey) {
    super()
    this.name = 'openai'
    this.model = 'gpt-4o-mini'
    this.client = new OpenAI({ apiKey })
  }
 
  async *streamChat({ messages, systemPrompt, maxTokens = 1000, correlationId, signal }) {
    const msgs = []
    if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt })
    msgs.push(...messages)
 
    try {
      const stream = await this.client.chat.completions.create(
        { 
          model: this.model, 
          messages: msgs, 
          max_tokens: maxTokens, 
          stream: true,
          stream_options: { include_usage: true } // Crucial for getting usage in final chunk
        },
        { signal }
      )
 
      let inputTokens = 0
      let outputTokens = 0
 
      for await (const chunk of stream) {
        if (signal?.aborted) break

        const token = chunk.choices[0]?.delta?.content
        if (token) {
          yield { type: 'token', content: token }
        }
        // usage data is in the last chunk with stream_options: { include_usage: true }
        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens
          outputTokens = chunk.usage.completion_tokens
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
    const p = PRICING[this.model] || PRICING['gpt-4o-mini']
    return ((inputTokens * p.input) + (outputTokens * p.output)) / 1_000_000
  }
}
