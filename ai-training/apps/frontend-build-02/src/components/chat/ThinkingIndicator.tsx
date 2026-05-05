import React from 'react'

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 px-12 py-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-claude-amber/60 animate-bounce [animation-duration:1s]" style={{ animationDelay: '0ms' }} />
        <div className="h-1.5 w-1.5 rounded-full bg-claude-amber/80 animate-bounce [animation-duration:1s]" style={{ animationDelay: '150ms' }} />
        <div className="h-1.5 w-1.5 rounded-full bg-claude-amber animate-bounce [animation-duration:1s]" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[13px] font-medium text-claude-secondary/60 italic tracking-wide">
        NovaSaaS AI is thinking...
      </span>
    </div>
  )
}
