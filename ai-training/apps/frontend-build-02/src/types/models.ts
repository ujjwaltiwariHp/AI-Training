export interface ModelInfo {
  id: string
  label: string
  tier: string
  badge: string
  badgeColor: string
  inputCost: number
  outputCost: number
  contextWindow: number
  description: string
  isDefault?: boolean
}
