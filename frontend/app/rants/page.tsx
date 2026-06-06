'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { TopBar } from '@/components/rants/TopBar'
import { TagsSidebar } from '@/components/rants/TagsSidebar'
import { RantFeed } from '@/components/rants/RantFeed'
import { CommunityPulse } from '@/components/rants/CommunityPulse'
import { CreateRantModal } from '@/components/rants/CreateRantModal'
import { PageRules } from '@/components/rants/PageRules'
import { useFeed } from '@/hooks/usePosts'
import { useCurrentUser } from '@/hooks/useAuth'
import type { FeedSort } from '@/lib/api/posts'

export default function RantsPage() {
  const router = useRouter()
  const { data: currentUser } = useCurrentUser()
  const isAuthenticated = !!currentUser

  const [sort, setSort] = useState<FeedSort>('hot')
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const feed = useFeed({
    sort,
    tag: selectedTag,
    q: searchQuery || undefined,
    type: 'RANT',
  })

  const pages = feed.data?.pages ?? []
  const posts = pages.flatMap((page) => page.posts)
  const firstPage = pages[0]
  const locked = firstPage?.locked ?? false
  const remainingLocked = firstPage?.remaining_locked ?? 0

  const handleCreateRant = () => {
    if (!isAuthenticated) {
      router.push('/login?next=/rants')
      return
    }
    setShowCreateModal(true)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTag((current) => (current === tag ? undefined : tag))
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TopBar onSearch={setSearchQuery} onCreateRant={handleCreateRant} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <TagsSidebar onTagSelect={handleTagSelect} selectedTag={selectedTag} />
          </aside>

          <section className="lg:col-span-6">
            <RantFeed
              posts={posts}
              sort={sort}
              onSortChange={setSort}
              isAuthenticated={isAuthenticated}
              isLoading={feed.isLoading}
              isError={feed.isError}
              onRetry={() => feed.refetch()}
              hasActiveFilters={Boolean(selectedTag || searchQuery)}
              locked={locked}
              remainingLocked={remainingLocked}
              hasMore={!!feed.hasNextPage}
              isFetchingMore={feed.isFetchingNextPage}
              onLoadMore={() => feed.fetchNextPage()}
            />
            <PageRules />
          </section>

          <aside className="lg:col-span-3">
            <CommunityPulse />
          </aside>
        </div>
      </main>

      <CreateRantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => feed.refetch()}
      />

      <Footer />
    </div>
  )
}
