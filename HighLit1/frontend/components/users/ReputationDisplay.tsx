'use client'

interface ReputationDisplayProps {
  reputation: number
  showLabel?: boolean
}

export function ReputationDisplay({
  reputation,
  showLabel = true,
}: ReputationDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      {showLabel && <span className="text-gray-400">السمعة:</span>}
      <span className="font-semibold text-primary-400">{reputation}</span>
      <span className="text-yellow-400">⭐</span>
    </div>
  )
}

