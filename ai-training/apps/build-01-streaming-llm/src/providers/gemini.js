// src/providers/gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import { LLMProvider } from './base.js'
 
const PRICING = {
  'gemini-1.5-flash': { input: 0.075, output: 0.30 }, // per 1M tokens (approx)
  'gemini-2.0-flash-exp': { input: 0.10, output: 0.40 },
}
 
export class GeminiProvider extends LLMProvider {
  constructor(apiKey) {
    super()
    this.name = 'gemini'
    this.model = 'gemini-flash-latest' // Alias for current stable/beta flash version
    this.genAI = new GoogleGenerativeAI(apiKey)
  }
 
  async *streamChat({ messages, systemPrompt, maxTokens = 1000, correlationId, signal }) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: this.model,
        systemInstruction: systemPrompt
      })
 
      // Convert OpenAI-style messages to Gemini-style contents
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
 
      const result = await model.generateContentStream({
        contents,
        generationConfig: { maxOutputTokens: maxTokens }
      }, { signal })
 
      let assistantContent = ''
 
      for await (const chunk of result.stream) {
        if (signal?.aborted) break
        
        try {
          const token = chunk.text()
          if (token) {
            assistantContent += token
            yield { type: 'token', content: token }
          }
        } catch (e) {
          // If chunk.text() fails (e.g. blocked), we log it but don't crash
          console.warn('Gemini chunk error:', e.message)
        }
      }
 
      const response = await result.response
      const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 }
 
      yield {
        type: 'done',
        usage: {
          inputTokens: usage.promptTokenCount,
          outputTokens: usage.candidatesTokenCount,
          model: this.model,
          provider: this.name,
          cost: this.calculateCost(usage.promptTokenCount, usage.candidatesTokenCount)
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || signal?.aborted) return
      throw err
    }
  }
 
  calculateCost(inputTokens, outputTokens) {
    const p = PRICING[this.model] || PRICING['gemini-1.5-flash']
    return ((inputTokens * p.input) + (outputTokens * p.output)) / 1_000_000
  }
}
