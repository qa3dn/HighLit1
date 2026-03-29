'use client'

export function Scanlines() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.15),
          rgba(0, 0, 0, 0.15) 1px,
          transparent 1px,
          transparent 2px
        )`,
        animation: 'scanlines 8s linear infinite',
      }}
    />
  )
}

