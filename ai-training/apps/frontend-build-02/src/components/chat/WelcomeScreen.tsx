import React from 'react'
import { Sparkles, CreditCard, Shield, Briefcase, Zap } from 'lucide-react'

interface WelcomeScreenProps {
  onSuggest: (msg: string) => void
}

export function WelcomeScreen({ onSuggest }: WelcomeScreenProps) {
  const suggestions = [
    { text: "How do I upgrade my plan?", icon: <Zap size={18} /> },
    { text: "What payment methods do you accept?", icon: <CreditCard size={18} /> },
    { text: "Tell me about your security features", icon: <Shield size={18} /> },
    { text: "Explain the remote work policy", icon: <Briefcase size={18} /> }
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 w-full animate-in fade-in zoom-in-95 duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-claude-amber blur-3xl opacity-20 dark:opacity-10 animate-pulse" />
        <div className="relative w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-orange-300 dark:border-orange-500/30">
          <Sparkles className="text-white w-12 h-12" />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-claude-primary dark:text-white mb-4 tracking-tighter">
        NovaSaaS Intelligence
      </h1>
      <p className="text-lg text-claude-secondary/80 dark:text-gray-400 mb-12 max-w-lg leading-relaxed font-medium">
        Empowering your workflow with advanced AI operations and instant knowledge synthesis.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggest(s.text)}
            className="group p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl text-left hover:shadow-2xl hover:border-claude-amber/30 dark:hover:border-claude-amber/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 transform hover:-translate-y-1.5"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-claude-cream dark:bg-gray-800 rounded-2xl text-claude-amber group-hover:bg-claude-amber group-hover:text-white transition-all duration-300 shadow-sm">
                {s.icon}
              </div>
              <span className="text-[16px] font-bold text-claude-primary dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {s.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
