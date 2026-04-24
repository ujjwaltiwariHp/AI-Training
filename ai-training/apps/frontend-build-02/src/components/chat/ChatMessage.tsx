import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '@/types/chat'
import { TokenUsageBadge } from './TokenUsageBadge'
import { cn } from '@/lib/utils'
import { AlertCircle, Sparkles, User, Info } from 'lucide-react'

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isError = !!message.error

  return (
    <div className={cn(
      "group flex w-full flex-col gap-2 py-8 transition-colors duration-200",
      isUser ? "bg-white dark:bg-gray-950" : "bg-claude-cream/30 dark:bg-gray-900/20 border-y border-claude-border/50 dark:border-gray-800/50"
    )}>
      <div className={cn("mx-auto flex w-full max-w-4xl gap-4 px-4 lg:gap-6", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className={cn(
          "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-2xl border shadow-sm transition-transform duration-200 group-hover:scale-105",
          !isUser ? "bg-orange-600 text-white border-orange-500" : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
        )}>
          {!isUser ? <Sparkles size={20} /> : <User size={20} />}
        </div>

        <div className={cn("flex min-w-0 flex-1 flex-col gap-1", isUser ? "items-end" : "items-start")}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-claude-primary dark:text-gray-200 text-[13px] uppercase tracking-wider opacity-90">
              {isUser ? 'You' : 'NovaSaaS Intelligence'}
            </span>
            {isUser && (
              <span className="text-[11px] text-claude-secondary/60 dark:text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className={cn(
            "relative w-full max-w-3xl",
            isUser ? "text-right" : "text-left"
          )}>
            {isError ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 p-5 text-red-700 dark:text-red-400 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-bold tracking-tight uppercase">System Alert</div>
                  <div className="text-[14px] leading-relaxed opacity-90">
                    {message.error?.includes('401') 
                      ? "Authentication Failed: The provided AI token is invalid or expired. Please verify your credentials." 
                      : message.error}
                  </div>
                </div>
              </div>
            ) : (
              <div className={cn(
                "prose dark:prose-invert prose-slate prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-2xl prose-pre:shadow-2xl max-w-none transition-colors duration-500",
                isUser ? "bg-gray-50 dark:bg-gray-800/50 px-6 py-4 rounded-3xl inline-block text-claude-primary dark:text-gray-100 border border-gray-100 dark:border-gray-800 shadow-sm" : "text-claude-primary dark:text-gray-200"
              )}>
                {isUser ? (
                  <div className="whitespace-pre-wrap text-[16px] leading-relaxed">{message.content}</div>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content + (message.isStreaming ? ' ▌' : '')}
                  </ReactMarkdown>
                )}
              </div>
            )}
          </div>
          
          {!isUser && message.usage && !isError && (
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <TokenUsageBadge usage={message.usage} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
