import React from 'react'
import { UsageStats } from '@/types/chat'
import { formatCost, formatNumber } from '@/lib/utils'

export function TokenUsageBadge({ usage }: { usage: UsageStats }) {
  if (!usage) return null
  
  return (
    <div className="group relative inline-flex items-center text-xs text-claude-secondary mt-2 select-none" title={`Model: ${usage.model}`}>
      ↑ {formatNumber(usage.inputTokens)} &nbsp; ↓ {formatNumber(usage.outputTokens)} &nbsp; · &nbsp; {formatCost(usage.cost || 0)}
    </div>
  )
}
