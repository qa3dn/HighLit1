'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { playClickSound, playTypingSound } from '@/lib/audio'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'terminal' | 'default'
  showCursor?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'terminal', showCursor = false, onFocus, onChange, ...props }, ref) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      playClickSound()
      onFocus?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      playTypingSound()
      onChange?.(e)
    }

  return (
    <div className="relative flex items-center">
      <div className="text-terminal-accent font-mono text-sm mr-2">&gt;</div>
      <input
        ref={ref}
        className={clsx(
          'bg-transparent border-none text-terminal-text',
          'px-2 py-2 font-mono text-sm flex-1',
          'focus:outline-none',
          'transition-colors',
          'placeholder:text-terminal-gray',
          className
        )}
        onFocus={handleFocus}
        onChange={handleChange}
        {...props}
      />
      {showCursor && (
        <span className="text-terminal-accent cursor-blink font-mono ml-1">
          _
        </span>
      )}
    </div>
  )
  }
)

Input.displayName = 'Input'

