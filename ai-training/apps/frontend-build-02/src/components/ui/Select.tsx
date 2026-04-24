import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps {
  value: string
  onChange: (val: string) => void
  options: { label: string; value: string }[]
  className?: string
}

export function Select({ value, onChange, options, className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedTarget = options.find(o => o.value === value)

  return (
    <div ref={ref} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-claude-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-claude-amber"
      >
        <span className="truncate">{selectedTarget?.label || 'Select...'}</span>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-claude-border bg-white shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-auto py-1">
             {options.map((option) => (
                <li
                  key={option.value}
                  className={cn(
                    "cursor-pointer select-none py-2 px-3 hover:bg-claude-cream",
                    option.value === value ? "bg-claude-cream font-medium" : "text-gray-900"
                  )}
                  onClick={() => {
                     onChange(option.value)
                     setIsOpen(false)
                  }}
                >
                   {option.label}
                </li>
             ))}
          </ul>
        </div>
      )}
    </div>
  )
}
