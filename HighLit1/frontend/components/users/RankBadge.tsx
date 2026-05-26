'use client'

interface RankBadgeProps {
  rank: string
  size?: 'sm' | 'md' | 'lg'
}

const rankColors: Record<string, string> = {
  INTERN: 'bg-gray-600',
  JUNIOR: 'bg-blue-600',
  MID: 'bg-green-600',
  SENIOR: 'bg-purple-600',
  ARCHITECT: 'bg-yellow-600',
}

const rankLabels: Record<string, string> = {
  INTERN: 'متدرب',
  JUNIOR: 'جونيور',
  MID: 'ميد',
  SENIOR: 'سينيور',
  ARCHITECT: 'مهندس معماري',
}

export function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={`${rankColors[rank] || rankColors.INTERN} ${
        sizeClasses[size]
      } rounded-full font-semibold text-white inline-flex items-center gap-1`}
    >
      {rankLabels[rank] || rank}
    </span>
  )
}

