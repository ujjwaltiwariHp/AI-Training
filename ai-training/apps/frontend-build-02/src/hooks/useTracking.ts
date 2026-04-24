import { useChatStore } from '@/store/chatStore'

export function useTrackingLogger() {
  const logAction = async (action: string, details?: any) => {
    // we fetch current state dynamically to get latest session id
    const { browserSessionId } = useChatStore.getState()
    try {
      await fetch(`${process.env.NEXT_PUBLIC_STREAMING_BACKEND || 'http://localhost:3000'}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: browserSessionId || 'anonymous',
          action,
          details
        })
      })
    } catch(e) {
      // Intentionally swallow logging errors
    }
  }

  return { logAction }
}
