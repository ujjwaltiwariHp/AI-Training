import React, { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { cn } from '@/lib/utils'
import { ArrowUp, Square, Cpu, ShieldCheck } from 'lucide-react'

interface ChatInputProps {
  onSend: (msg: string) => void
  onStop: () => void
  isStreaming: boolean
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { mode, selectedModel } = useChatStore()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isStreaming) {
        onSend(input)
        setInput('')
      }
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-950 via-white/90 dark:via-gray-950/90 to-transparent pt-12 pb-6 px-4 transition-colors duration-500">
      <div className="max-w-4xl mx-auto w-full relative group">
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/60 dark:border-gray-800 focus-within:border-claude-amber/50 transition-all duration-300 ring-4 ring-transparent focus-within:ring-claude-amber/5 flex items-end overflow-hidden">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NovaSaaS AI..."
            className="w-full max-h-[200px] py-5 pl-6 pr-16 bg-transparent border-none focus:ring-0 resize-none text-claude-primary dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-[16px] outline-none leading-relaxed"
            style={{ minHeight: '64px' }}
          />
          
          <div className="absolute right-3 bottom-3">
            {!isStreaming ? (
              <button
                onClick={() => {
                  if (input.trim()) {
                    onSend(input); setInput('')
                  }
                }}
                disabled={!input.trim()}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                  input.trim() 
                    ? "bg-claude-amber text-white hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                )}
              >
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={onStop}
                className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-all duration-300 shadow-lg animate-pulse"
                title="Stop generation"
              >
                <Square size={16} fill="currentColor" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-claude-secondary uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-inner">
             <Cpu size={12} className="text-claude-amber" />
             <span>{selectedModel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-claude-secondary uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shadow-inner">
             <ShieldCheck size={12} className="text-green-600" />
             <span>{mode === 'faq' ? 'FAQ Policy Mode' : 'Direct Intelligence'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
