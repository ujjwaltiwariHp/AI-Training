import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, Message } from '@/types/chat'
import { generateId } from '@/lib/utils'
import { DEFAULT_MODEL } from '@/lib/models'

interface ChatStore {
  browserSessionId: string
  conversations: Conversation[]
  activeConversationId: string | null
  selectedModel: string
  mode: 'direct' | 'faq'
  theme: 'light' | 'dark'
  sidebarOpen: boolean

  // Actions
  initSession: () => void
  toggleTheme: () => void
  createConversation: () => string
  deleteConversation: (id: string) => void
  setActiveConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, update: Partial<Message>) => void
  setSelectedModel: (model: string) => void
  setMode: (mode: 'direct' | 'faq') => void
  setSidebarOpen: (open: boolean) => void
  clearConversation: (id: string) => void
  getActiveConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      browserSessionId: '',
      conversations: [],
      activeConversationId: null,
      selectedModel: DEFAULT_MODEL,
      mode: 'direct',
      theme: 'light',
      sidebarOpen: true,

      initSession: () => {
        if (!get().browserSessionId) {
          set({ browserSessionId: generateId() })
        }
      },

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        if (next === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      },

      createConversation: () => {
        const id = generateId()
        const newConv: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          model: get().selectedModel,
          mode: get().mode
        }
        set(s => ({ conversations: [newConv, ...s.conversations], activeConversationId: id }))
        return id
      },

      deleteConversation: (id) => set(s => ({
        conversations: s.conversations.filter(c => c.id !== id),
        activeConversationId: s.activeConversationId === id
          ? s.conversations[0]?.id ?? null
          : s.activeConversationId
      })),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, message) => set(s => ({
        conversations: s.conversations.map(c =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, message], updatedAt: new Date(),
                title: c.messages.length === 0 ? message.content.slice(0, 40) : c.title }
            : c
        )
      })),

      updateMessage: (conversationId, messageId, update) => set(s => ({
        conversations: s.conversations.map(c =>
          c.id === conversationId
            ? { ...c, messages: c.messages.map(m => m.id === messageId ? { ...m, ...update } : m) }
            : c
        )
      })),

      setSelectedModel: (model) => set({ selectedModel: model }),
      setMode: (mode) => set({ mode }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      clearConversation: (id) => set(s => ({
        conversations: s.conversations.map(c =>
          c.id === id ? { ...c, messages: [], updatedAt: new Date() } : c
        )
      })),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get()
        return conversations.find(c => c.id === activeConversationId)
      }
    }),
    { name: 'chat-storage', partialize: (s) => ({ browserSessionId: s.browserSessionId, conversations: s.conversations, selectedModel: s.selectedModel, theme: s.theme }) }
  )
)
