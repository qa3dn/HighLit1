'use client'

import { ReactNode } from 'react'

interface WindowProps {
  title: string
  path?: string
  children: ReactNode
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  className?: string
}

export function Window({
  title,
  path,
  children,
  onClose,
  onMinimize,
  onMaximize,
  className = '',
}: WindowProps) {
  return (
    <div className={`terminal-window ${className} animate-window-appear flex flex-col`}>
      {/* Title Bar */}
      <div className="terminal-title-bar flex-shrink-0">
        <div className="flex items-center gap-2">
          {path && (
            <span className="text-text font-mono text-xs">
              {path}
            </span>
          )}
          <span className="text-text font-mono text-xs">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="terminal-button"
              aria-label="Minimize"
            >
              <span className="text-[8px] text-text">_</span>
            </button>
          )}
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="terminal-button"
              aria-label="Maximize"
            >
              <span className="text-[8px] text-text">□</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="terminal-button close"
              aria-label="Close"
            >
              <span className="text-[8px] text-text">×</span>
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      <div className="p-4 bg-bg min-h-[200px] relative z-10 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

