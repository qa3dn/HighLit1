'use client'

import { useState, useRef, useEffect } from 'react'

interface TerminalInputProps {
  prompt?: string
  onCommand?: (command: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TerminalInput({
  prompt = 'Guest@Majlis:~$',
  onCommand,
  placeholder = '',
  disabled = false,
  className = '',
}: TerminalInputProps) {
  const [input, setInput] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus()
    }
  }, [disabled])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && onCommand) {
      onCommand(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`} dir="ltr">
      <span className="text-terminal-text font-mono text-sm">{prompt}</span>
      <div className="flex-1 flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-terminal-text font-mono text-sm focus:outline-none"
          autoFocus
        />
        <span
          className={`text-terminal-text font-mono ${
            showCursor ? 'opacity-100' : 'opacity-0'
          } transition-opacity`}
        >
          _
        </span>
      </div>
    </form>
  )
}

