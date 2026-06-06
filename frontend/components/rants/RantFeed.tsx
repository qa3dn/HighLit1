'use client'

import { Flame, Clock, TrendingUp, AlertTriangle, Inbox } from 'lucide-react'
import { RantCard } from './RantCard'
import { RantCardSkeleton } from './RantCardSkeleton'
import { LockedGate } from './LockedGate'
import { playClickSound } from '@/lib/audio'
import type { FeedSort, Post } from '@/lib/api/posts'

interface RantFeedProps {
  posts: Post[]
  sort: FeedSort
  onSortChange: (sort: FeedSort) => void
  isAuthenticated: boolean
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  hasActiveFilters: boolean
  locked: boolean
  remainingLocked: number
  hasMore: boolean
  isFetchingMore: boolean
  onLoadMore: () => void
}

const SORT_OPTIONS: { value: FeedSort; label: string; icon: typeof Flame }[] = [
  { value: 'hot', label: 'الأكثر تفاعلاً', icon: Flame },
  { value: 'recent', label: 'الأحدث', icon: Clock },
  { value: 'top', label: 'الأعلى', icon: TrendingUp },
]

export function RantFeed({
  posts,
  sort,
  onSortChange,
  isAuthenticated,
  isLoading,
  isError,
  onRetry,
  hasActiveFilters,
  locked,
  remainingLocked,
  hasMore,
  isFetchingMore,
  onLoadMore,
}: RantFeedProps) {
  return (
    <div dir="rtl">
      {/* Sort tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-dark">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon
          const active = sort === option.value
          return (
            <button
              key={option.value}
              onClick={() => {
                playClickSound()
                onSortChange(option.value)
              }}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-sm transition-all ${
                active
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:border-gray-dark hover:text-text'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {option.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div>
          {Array.from({ length: 4 }).map((_, i) => (
            <RantCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 py-16 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400" aria-hidden />
          <p className="font-mono text-text">تعذّر تحميل الفضفضات.</p>
          <button
            onClick={() => {
              playClickSound()
              onRetry()
            }}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-dark bg-gray-light py-16 text-center font-mono text-text-secondary">
          <Inbox className="h-10 w-10 opacity-40" aria-hidden />
          {hasActiveFilters ? (
            <p className="text-sm">ما في فضفضات مطابقة لبحثك.</p>
          ) : (
            <>
              <p className="text-lg text-text">ما في فضفضات هون</p>
              <p className="text-sm">كن أول واحد يفضفض!</p>
            </>
          )}
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <RantCard key={post.id} post={post} isAuthenticated={isAuthenticated} />
          ))}

          {locked && <LockedGate remaining={remainingLocked} />}

          {!locked && hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  playClickSound()
                  onLoadMore()
                }}
                disabled={isFetchingMore}
                className="rounded-xl border border-gray-dark bg-gray-light px-6 py-2.5 text-sm font-medium text-text transition hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {isFetchingMore ? '...جارٍ التحميل' : 'تحميل المزيد'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
