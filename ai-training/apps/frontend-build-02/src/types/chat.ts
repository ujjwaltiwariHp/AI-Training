export type Role = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: Date
  usage?: UsageStats
  isStreaming?: boolean
  error?: string
}

export interface UsageStats {
  inputTokens: number
  outputTokens: number
  model: string
  cost: number
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  model: string
  mode: 'direct' | 'faq'
}
