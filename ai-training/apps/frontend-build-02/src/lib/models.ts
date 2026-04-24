import { ModelInfo } from '@/types/models'

export const ANTHROPIC_MODELS: ModelInfo[] = [
  {
    id: 'claude-opus-4-5',
    label: 'Claude Opus',
    tier: 'Most Capable',
    badge: '⚡ Pro',
    badgeColor: 'text-claude-amber',
    inputCost: 15.00,
    outputCost: 75.00,
    contextWindow: 200000,
    description: 'Most powerful. Best for complex reasoning.'
  },
  {
    id: 'claude-sonnet-4-5',
    label: 'Claude Sonnet',
    tier: 'Balanced',
    badge: '🔥 Balanced',
    badgeColor: 'text-claude-amber',
    inputCost: 3.00,
    outputCost: 15.00,
    contextWindow: 200000,
    description: 'Best balance of speed and intelligence.'
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku',
    tier: 'Fast',
    badge: '⚡ Fast',
    badgeColor: 'text-claude-amber',
    inputCost: 0.80,
    outputCost: 4.00,
    contextWindow: 200000,
    description: 'Fastest and most affordable.',
    isDefault: true
  }
]

export const DEFAULT_MODEL = 'claude-haiku-4-5'

export function calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = ANTHROPIC_MODELS.find(m => m.id === modelId)
  if (!model) return 0
  const inputCost = (inputTokens / 1_000_000) * model.inputCost
  const outputCost = (outputTokens / 1_000_000) * model.outputCost
  return inputCost + outputCost
}
