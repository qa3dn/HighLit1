'use client'

interface DailyCounterProps {
  count: number
}

export function DailyCounter({ count }: DailyCounterProps) {
  return (
    <div className="bg-gray-light rounded-lg p-4 border border-accent/30">
      <div className="text-center">
        <div className="text-3xl font-bold text-accent mb-2 font-mono">{count}</div>
        <div className="text-text text-sm font-mono">
          اليوم حسّينا مع {count} مبرمج
        </div>
      </div>
    </div>
  )
}

