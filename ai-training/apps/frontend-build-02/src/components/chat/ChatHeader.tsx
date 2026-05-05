import React, { useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { ModelSelector } from './ModelSelector'
import { Menu, Trash2, Zap, BookOpen, Sun, Moon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function ChatHeader() {
  const { sidebarOpen, setSidebarOpen, mode, setMode, activeConversationId, clearConversation, theme, toggleTheme } = useChatStore()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <>
      <div className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20 shrink-0 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-claude-secondary transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-claude-primary dark:text-white tracking-tight leading-none mb-1">NovaSaaS</span>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">Intelligence Hub</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
          <ModelSelector />
        </div>

        <div className="flex items-center gap-3">
          <button 
             onClick={toggleTheme}
             className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-orange-600 transition-all shadow-inner"
             title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button 
             onClick={() => setMode(mode === 'direct' ? 'faq' : 'direct')}
             className="group relative flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-claude-amber/30 transition-all duration-300 shadow-inner"
          >
            {mode === 'faq' ? (
              <BookOpen size={14} className="text-orange-600" />
            ) : (
              <Zap size={14} className="text-blue-600" />
            )}
            <span className="text-[12px] font-bold text-claude-primary dark:text-gray-300 opacity-80 uppercase tracking-wider">
               {mode === 'faq' ? 'FAQ Policy' : 'Direct AI'}
            </span>
          </button>

          <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

          {activeConversationId && (
            <button 
               onClick={() => setIsDeleteModalOpen(true)}
               className="p-2.5 text-claude-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200"
               title="Clear Chat"
            >
               <Trash2 className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Clear Conversation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={() => {
                if (activeConversationId) clearConversation(activeConversationId)
                setIsDeleteModalOpen(false)
              }}
            >
              Clear Messages
            </Button>
          </>
        }
      >
        Are you sure you want to clear all messages in this conversation? This action cannot be undone.
      </Modal>
    </>
  )
}
