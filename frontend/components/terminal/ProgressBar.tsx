'use client'

import { useEffect, useState } from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = '',
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    const targetProgress = Math.min(100, Math.max(0, progress))
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress)
        }
        return prev
      })
    }, 50)

    return () => clearInterval(interval)
  }, [progress])

  const filledBlocks = Math.floor(displayProgress / 10)
  const emptyBlocks = 10 - filledBlocks

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <div className="text-terminal-text text-xs font-mono">{label}</div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-0.5">
          {Array(filledBlocks)
            .fill(0)
            .map((_, i) => (
              <div
                key={`filled-${i}`}
                className="h-4 flex-1 bg-terminal-text border border-terminal-text"
              />
            ))}
          {Array(emptyBlocks)
            .fill(0)
            .map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-4 flex-1 bg-terminal-dark-gray border border-terminal-gray"
              />
            ))}
        </div>
        {showPercentage && (
          <span className="text-terminal-text font-mono text-xs min-w-[40px] text-right">
            {Math.round(displayProgress)}%
          </span>
        )}
      </div>
    </div>
  )
}

