'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { TopBar } from '@/components/rants/TopBar'
import { TagsSidebar } from '@/components/rants/TagsSidebar'
import { RantFeed } from '@/components/rants/RantFeed'
import { CommunityPulse } from '@/components/rants/CommunityPulse'
import { CreateRantModal } from '@/components/rants/CreateRantModal'
import { PageRules } from '@/components/rants/PageRules'
import { api } from '@/lib/api'

export default function RantsPage() {
  const queryClient = useQueryClient()
  const [sort, setSort] = useState('recent')
  const [selectedTag, setSelectedTag] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: rants, isLoading } = useQuery({
    queryKey: ['rants', sort, selectedTag],
    queryFn: async () => {
      if (selectedTag) {
        const { data } = await api.get(`/posts/tags/${selectedTag}`)
        return data
      }
      const { data } = await api.get('/posts/rants', {
        params: { sort },
      })
      return data
    },
  })

  const filteredRants = searchQuery
    ? rants?.filter((rant: any) =>
        rant.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rants

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['rants'] })
    queryClient.invalidateQueries({ queryKey: ['tags'] })
    queryClient.invalidateQueries({ queryKey: ['daily-stats'] })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilter = (filters: any) => {
    // Handle filter logic if needed
    console.log('Filters:', filters)
  }

  const handleTagSelect = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(undefined)
    } else {
      setSelectedTag(tag)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Top Bar */}
        <TopBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          onCreateRant={() => setShowCreateModal(true)}
        />

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Tags */}
          <aside className="lg:col-span-3">
            <TagsSidebar
              onTagSelect={handleTagSelect}
              selectedTag={selectedTag}
            />
          </aside>

          {/* Main Feed */}
          <section className="lg:col-span-6">
            {isLoading ? (
              <div className="text-center py-12 text-text-secondary">
                <p>جاري التحميل...</p>
              </div>
            ) : (
              <RantFeed
                rants={filteredRants || []}
                sort={sort}
                onSortChange={setSort}
              />
            )}

            {/* Page Rules */}
            <PageRules />
          </section>

          {/* Right Sidebar - Community Pulse */}
          <aside className="lg:col-span-3">
            <CommunityPulse />
          </aside>
        </div>
      </main>

      {/* Create Rant Modal */}
      <CreateRantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePostCreated}
      />

      <Footer />
    </div>
  )
}
