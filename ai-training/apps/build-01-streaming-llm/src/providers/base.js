// src/providers/base.js
export class LLMProvider {
  /**
   * Stream a chat completion.
   * Must yield objects: { type: "token", content: string }
   * Finally yield: { type: "done", usage: { inputTokens, outputTokens, model, provider, cost } }
   */
  async *streamChat({ messages, systemPrompt, maxTokens, correlationId, signal }) {
    throw new Error(`${this.constructor.name} must implement streamChat`)
  }
 
  calculateCost(inputTokens, outputTokens) {
    throw new Error(`${this.constructor.name} must implement calculateCost`)
  }
}
