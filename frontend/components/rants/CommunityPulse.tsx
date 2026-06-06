'use client'

import { useQuery } from '@tanstack/react-query'
import { Flame, MessageSquare, Heart } from 'lucide-react'
import { api } from '@/lib/api'
import { Card } from '../ui/Card'

interface DailyStats {
  total_posts: number
  total_comments: number
  total_reactions: number
}

export function CommunityPulse() {
  const { data: stats } = useQuery<DailyStats>({
    queryKey: ['daily-stats'],
    queryFn: async () => {
      const { data } = await api.get<DailyStats>('/posts/stats/daily')
      return data
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const rows = [
    { icon: Flame, label: 'الفضفضات', value: stats?.total_posts ?? 0 },
    { icon: MessageSquare, label: 'التعليقات', value: stats?.total_comments ?? 0 },
    { icon: Heart, label: 'التفاعلات', value: stats?.total_reactions ?? 0 },
  ]

  return (
    <Card className="sticky top-20 space-y-4 border-gray-dark p-5" dir="rtl">
      <h2 className="font-mono text-lg font-bold text-text">نبض المجتمع</h2>

      <div className="space-y-2">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg border border-gray-dark bg-gray-light px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm text-text-secondary">
                <Icon className="h-4 w-4 text-accent/70" aria-hidden /> {row.label}
              </span>
              <span className="font-mono text-lg font-bold text-accent">{row.value}</span>
            </div>
          )
        })}
      </div>

      <p className="border-t border-gray-dark pt-3 text-xs leading-relaxed text-text-secondary">
        كل فضفضة بتذكّر حدا إنه مش لحاله. شارك وجعك… أو خفّف عن غيرك.
      </p>
    </Card>
  )
}
