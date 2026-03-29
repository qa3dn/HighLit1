'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card } from '../ui/Card'
import { DailyCounter } from './DailyCounter'

export function CommunityPulse() {
  const { data: stats } = useQuery({
    queryKey: ['daily-stats'],
    queryFn: async () => {
      const { data } = await api.get('/posts/stats/daily')
      return data
    },
    refetchInterval: 60000, // Refresh every minute
  })

  return (
    <Card className="p-6 sticky top-20 space-y-6 border-gray-dark" dir="rtl">
      <h2 className="text-xl font-bold text-text mb-4 font-mono">نبض HighLit</h2>

      {/* Daily Counter */}
      <DailyCounter count={stats?.feelYouCount || 0} />

      {/* Top Tag */}
      {stats?.topTag && (
        <div>
          <h3 className="text-sm text-text-secondary mb-2 font-mono">أكثر وسم اليوم</h3>
          <div className="bg-gray-light rounded-lg p-3 border border-gray-dark">
            <span className="text-accent font-mono">#{stats.topTag.name}</span>
            <span className="text-text-secondary text-sm mr-2 font-mono">
              ({stats.topTag.count} فضفضة)
            </span>
          </div>
        </div>
      )}

      {/* Top Rant */}
      {stats?.topRant && (
        <div>
          <h3 className="text-sm text-text-secondary mb-2 font-mono">
            فضفضة عليها تفاعل عالي
          </h3>
          <div className="bg-gray-light rounded-lg p-3 border border-gray-dark">
            <p className="text-text text-sm line-clamp-3 font-mono">
              {stats.topRant.content}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary font-mono">
              <span>
                {(stats.topRant.reactions || []).length} تفاعل
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Daily Quote */}
      {stats?.topRant && (
        <div className="pt-4 border-t border-gray-dark">
          <h3 className="text-sm text-text-secondary mb-2 font-mono">اقتباس اليوم</h3>
          <blockquote className="text-text italic text-sm font-mono">
            "{stats.topRant.content.substring(0, 100)}..."
          </blockquote>
        </div>
      )}
    </Card>
  )
}

