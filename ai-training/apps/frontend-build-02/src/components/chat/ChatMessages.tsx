import React, { useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { useChatStore } from '@/store/chatStore'
import { WelcomeScreen } from './WelcomeScreen'
import { ThinkingIndicator } from './ThinkingIndicator'

interface ChatMessagesProps {
  onSuggest: (msg: string) => void
}

export function ChatMessages({ onSuggest }: ChatMessagesProps) {
  const activeConv = useChatStore(s => s.getActiveConversation())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages])

  if (!activeConv || activeConv.messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto pb-40">
        <WelcomeScreen onSuggest={onSuggest} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto w-full pb-48 pt-4">
        {activeConv.messages.map((msg, index) => (
           <ChatMessage key={msg.id || index.toString()} message={msg} />
        ))}
        {activeConv.messages[activeConv.messages.length - 1]?.isStreaming && 
         activeConv.messages[activeConv.messages.length - 1]?.content === '' && (
          <ThinkingIndicator />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
