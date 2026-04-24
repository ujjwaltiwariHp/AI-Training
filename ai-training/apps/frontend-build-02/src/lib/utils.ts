import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCost(cost: number): string {
  if (cost < 0.001) return '<$0.001'
  return `$${cost.toFixed(4)}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15)
}

export function truncateTitle(text: string, maxLength = 40): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
}
