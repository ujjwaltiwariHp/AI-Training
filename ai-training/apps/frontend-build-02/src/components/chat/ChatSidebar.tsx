import React from 'react'
import { useChatStore } from '@/store/chatStore'
import { truncateTitle, cn } from '@/lib/utils'
import { MessageSquare, Trash2, Plus, X, Globe, Zap } from 'lucide-react'

export function ChatSidebar() {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversation, 
    createConversation, 
    deleteConversation,
    sidebarOpen,
    setSidebarOpen,
    theme
  } = useChatStore()

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300" 
           onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Desktop + Mobile */}
      <div className={cn(
        "fixed md:relative top-0 left-0 h-full bg-gray-900 dark:bg-black w-[280px] flex flex-col transition-all duration-300 ease-in-out z-40 shrink-0 border-r border-gray-800 dark:border-gray-900",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0 md:w-0 overflow-hidden"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6 px-2 md:hidden">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                 <Zap size={16} className="text-white" />
               </div>
               <span className="text-white font-bold tracking-tight">NovaSaaS AI</span>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>

          <button
            onClick={() => {
              const id = createConversation()
              setActiveConversation(id)
              if (window.innerWidth < 768) setSidebarOpen(false)
            }}
            className="w-full group flex items-center justify-center gap-2 bg-gray-800 hover:bg-orange-600 text-gray-200 hover:text-white px-4 py-3 rounded-2xl transition-all duration-300 border border-gray-700 hover:border-orange-500 shadow-lg hover:shadow-orange-900/20 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span className="font-bold text-sm tracking-wide">New Interaction</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
          {conversations.map(conv => {
            const isActive = conv.id === activeConversationId
            return (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center justify-between w-full p-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-sm",
                  isActive 
                    ? "bg-gray-800 text-white shadow-md border border-gray-700" 
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                )}
                onClick={() => {
                   setActiveConversation(conv.id)
                   if (window.innerWidth < 768) setSidebarOpen(false)
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <MessageSquare className={cn("w-4.5 h-4.5 shrink-0 transition-colors", isActive ? "text-orange-500" : "opacity-40")} />
                  <span className={cn("truncate font-medium tracking-tight", isActive ? "opacity-100" : "opacity-80")}>
                    {truncateTitle(conv.title, 24)}
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Permanently delete this interaction?')) deleteConversation(conv.id)
                  }}
                  className={cn(
                    "p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/10 rounded-lg",
                    isActive ? "opacity-100" : ""
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>

        <div className="p-5 border-t border-gray-800/50 mt-auto bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Globe size={14} className="text-gray-500" />
               <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Global Engine</span>
             </div>
             <div className="flex items-center gap-1.5">
               <span className="text-[10px] font-bold text-gray-500 uppercase">Live</span>
               <div className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </>
  )
}
