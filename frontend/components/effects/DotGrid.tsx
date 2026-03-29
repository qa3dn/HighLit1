'use client'

interface DotGridProps {
  size?: number
  spacing?: number
  opacity?: number
  className?: string
}

export function DotGrid({
  size = 1,
  spacing = 20,
  opacity = 0.03,
  className = '',
}: DotGridProps) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, ${opacity}) ${size}px, transparent ${size}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: '0 0',
      }}
    />
  )
}

