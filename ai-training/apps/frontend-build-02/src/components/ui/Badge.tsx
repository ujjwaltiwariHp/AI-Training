import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pro' | 'fast' | 'balanced'
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const baseClass = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none'
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    pro: 'bg-purple-100 text-purple-800',
    fast: 'bg-blue-100 text-blue-800',
    balanced: 'bg-orange-100 text-orange-800'
  }

  return (
    <span className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
