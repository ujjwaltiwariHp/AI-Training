import React, { useEffect, useState } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { ChatHeader } from './ChatHeader'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'
import { useChat } from '@/hooks/useChat'
import { useChatStore } from '@/store/chatStore'
import { useTrackingLogger } from '@/hooks/useTracking'

export function ChatContainer() {
  const { activeConversationId, createConversation, initSession } = useChatStore()
  const { sendMessage, stopStreaming, isStreaming } = useChat(activeConversationId)
  const { logAction } = useTrackingLogger()
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Initialization check
  useEffect(() => {
    setMounted(true)
    initSession()
    logAction('page_load', { path: '/chat' })
    if (!activeConversationId) {
       createConversation()
    }
  }, [activeConversationId, createConversation, initSession])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  if (!mounted) return null

  return (
    <div 
      className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-500 relative"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Cursor Aura */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-40 dark:opacity-20 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(251, 146, 60, 0.15), transparent)`
        }}
      />

      <ChatSidebar />
      
      <div className="flex-1 flex flex-col relative h-full min-w-0 bg-transparent z-10">
        <ChatHeader />
        
        <ChatMessages onSuggest={(msg) => sendMessage(msg)} />
        
        <ChatInput 
          onSend={(msg) => sendMessage(msg)} 
          onStop={stopStreaming} 
          isStreaming={isStreaming} 
        />
      </div>
    </div>
  )
}
