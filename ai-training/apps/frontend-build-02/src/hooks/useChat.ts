import { useState, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import { generateId } from '@/lib/utils'
import { Message, UsageStats } from '@/types/chat'
import { parseSSELine } from '@/lib/streaming'
import { useTrackingLogger } from './useTracking'

export function useChat(conversationId: string | null) {
  const store = useChatStore()
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const { logAction } = useTrackingLogger()

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return
    
    const convId = conversationId ?? store.createConversation()
    
    const userMessage: Message = { id: generateId(), role: 'user', content, timestamp: new Date() }
    store.addMessage(convId, userMessage)
    
    const assistantId = generateId()
    store.addMessage(convId, { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true })
    
    setIsStreaming(true)
    abortRef.current = new AbortController()

    logAction('send_message', { conversationId: convId, model: store.selectedModel, mode: store.mode })
    
    try {
      const conv = store.conversations.find(c => c.id === convId)
      
      const endpoint = store.mode === 'faq' 
          ? '/api/chat' 
          : `${process.env.NEXT_PUBLIC_STREAMING_BACKEND || 'http://localhost:3001'}/api/chat`

      let bodyData;
      if (store.mode === 'faq') {
          const historyMessages = conv?.messages
            .filter(m => m.id !== assistantId && m.id !== userMessage.id && !m.error)
            .map(m => ({ role: m.role, content: m.content })) ?? []
          bodyData = {
              messages: [...historyMessages, { role: 'user', content }],
              model: store.selectedModel,
              mode: store.mode,
              sessionId: convId
          }
      } else {
          // Send to build-01-streaming-llm which tracks context internally via sessionId
          bodyData = {
              sessionId: convId,
              browserSessionId: store.browserSessionId,
              message: content,
              provider: 'anthropic' // Backend will auto-detect if this is bedrock via key prefix
          }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify(bodyData)
      })

      if (response.status === 429) {
          const err = await response.json()
          store.updateMessage(convId, assistantId, { error: err.error || 'Rate limit exceeded.', isStreaming: false })
          setIsStreaming(false)
          return
      }
      
      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulatedContent = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const lines = decoder.decode(value, { stream: true }).split('\n')
          for (const line of lines) {
            const data = parseSSELine(line)
            if (!data) continue

            if (data.type === 'token') {
              accumulatedContent += data.content
              store.updateMessage(convId, assistantId, { content: accumulatedContent })
            }
            if (data.type === 'done') {
              store.updateMessage(convId, assistantId, { usage: data.usage as UsageStats, isStreaming: false })
            }
            if (data.type === 'error') {
              store.updateMessage(convId, assistantId, { error: data.message, isStreaming: false })
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        store.updateMessage(convId, assistantId, { error: `Error: ${(err as Error).message}`, isStreaming: false })
      }
    } finally {
      setIsStreaming(false)
    }
  }

  const stopStreaming = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  return { sendMessage, stopStreaming, isStreaming }
}
