'use client'

import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Window } from '@/components/terminal/Window'
import { PostCard } from '@/components/posts/PostCard'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface MyRantsProps {
  userId: string
  isOwnProfile: boolean
}

type FilterType = 'all' | 'public' | 'anonymous' | 'private'

export function MyRants({ userId, isOwnProfile }: MyRantsProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['user-rants', userId],
    queryFn: async () => {
      const { data } = await api.get(`/posts?user_id=${userId}`)
      return Array.isArray(data) ? data : []
    },
    enabled: !!userId,
  })

  const filteredPosts = posts.filter((post: any) => {
    if (filter === 'all') return true
    if (filter === 'public') return !post.is_anonymous
    if (filter === 'anonymous') return post.is_anonymous
    return false
  })

  const stats = {
    total: posts.length,
    public: posts.filter((p: any) => !p.is_anonymous).length,
    anonymous: posts.filter((p: any) => p.is_anonymous).length,
    reactions: posts.reduce((sum: number, p: any) => sum + (p.reactions?.length || 0), 0),
  }

  if (isLoading) {
    return (
      <Window title="فضفضاتي" path="~/rants">
        <div className="text-text-secondary text-center py-8 font-mono">
          جاري التحميل...
        </div>
      </Window>
    )
  }

  return (
    <Window title="فضفضاتي" path="~/rants">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="border border-gray rounded-lg p-3 bg-bg">
            <div className="text-text-secondary text-xs font-mono mb-1">
              إجمالي الفضفضات
            </div>
            <div className="text-accent text-xl font-mono font-bold">
              {stats.total}
            </div>
          </div>
          <div className="border border-gray rounded-lg p-3 bg-bg">
            <div className="text-text-secondary text-xs font-mono mb-1">
              عامة
            </div>
            <div className="text-accent text-xl font-mono font-bold">
              {stats.public}
            </div>
          </div>
          <div className="border border-gray rounded-lg p-3 bg-bg">
            <div className="text-text-secondary text-xs font-mono mb-1">
              مجهولة
            </div>
            <div className="text-accent text-xl font-mono font-bold">
              {stats.anonymous}
            </div>
          </div>
          <div className="border border-gray rounded-lg p-3 bg-bg">
            <div className="text-text-secondary text-xs font-mono mb-1">
              تفاعلات
            </div>
            <div className="text-accent text-xl font-mono font-bold">
              {stats.reactions}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-text-secondary" />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'public', 'anonymous'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded font-mono text-sm transition-all ${
                  filter === f
                    ? 'bg-accent text-bg'
                    : 'bg-gray text-text hover:bg-accent hover:text-bg'
                }`}
              >
                {f === 'all' ? 'الكل' : f === 'public' ? 'عامة' : 'مجهولة'}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-text-secondary text-center py-12 font-mono">
            {filter === 'all' ? (
              <>
                <p className="mb-4">لا توجد فضفضات بعد</p>
                <p className="text-sm">ابدأ بفضفضة جديدة!</p>
              </>
            ) : (
              <p>لا توجد فضفضات بهذا التصفية</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Window>
  )
}

