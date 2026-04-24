import React, { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { Badge } from '@/components/ui/Badge'
import { useModels } from '@/hooks/useModels'
import { cn } from '@/lib/utils'
import { ChevronDown, Check, Sparkles, Zap, Flame } from 'lucide-react'

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore()
  const { models } = useModels()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = models.find(m => m.id === selectedModel) || models[0]
  if (!current) return null

  const getIcon = (id: string) => {
    if (id.includes('opus')) return <Sparkles size={14} className="text-purple-500" />
    if (id.includes('sonnet')) return <Flame size={14} className="text-orange-500" />
    return <Zap size={14} className="text-blue-500" />
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-gray-100 hover:border-claude-amber/30 hover:shadow-md transition-all duration-300 focus:outline-none ring-2 ring-transparent focus:ring-claude-amber/10 active:scale-95"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
          {getIcon(current.id)}
        </div>
        <span className="text-[14px] font-bold text-claude-primary tracking-tight">{current.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-claude-secondary transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-50 bg-gray-50/50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-2">Select Model</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-1.5">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex flex-col gap-1 hover:bg-gray-50 group",
                  selectedModel === model.id ? "bg-claude-cream/50" : ""
                )}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm">
                      {getIcon(model.id)}
                    </div>
                    <span className={cn("font-bold text-[14px] transition-colors", selectedModel === model.id ? "text-orange-600" : "text-claude-primary")}>
                      {model.label}
                    </span>
                  </div>
                  {selectedModel === model.id ? (
                    <Check size={16} className="text-orange-600" />
                  ) : (
                    <Badge variant={model.id.includes('opus') ? 'pro' : model.id.includes('sonnet') ? 'balanced' : 'fast'} className="text-[10px] opacity-70">
                      {model.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-[12px] text-claude-secondary leading-normal pl-7 opacity-80 group-hover:opacity-100">
                  {model.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
