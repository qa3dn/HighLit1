'use client'

interface CursorBlinkProps {
  className?: string
}

export function CursorBlink({ className = '' }: CursorBlinkProps) {
  return (
    <span
      className={`inline-block w-2 h-4 bg-terminal-accent cursor-blink ${className}`}
    />
  )
}

