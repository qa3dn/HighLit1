'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Window } from '@/components/terminal/Window'
import { StressMeter } from '@/components/dashboard/StressMeter'
import { Button } from '@/components/ui/Button'
import { PostCard } from '@/components/posts/PostCard'
import { CreatePostModal } from '@/components/posts/CreatePostModal'
import { api } from '@/lib/api'

export default function FeedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: posts, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/posts')
        // Ensure we return an array
        if (Array.isArray(data)) {
          return data
        }
        // If data is wrapped in another object, try to extract the array
        if (data && Array.isArray(data.data)) {
          return data.data
        }
        // If data is an object with posts property
        if (data && Array.isArray(data.posts)) {
          return data.posts
        }
        // Default to empty array if structure is unexpected
        console.warn('Unexpected posts data structure:', data)
        return []
      } catch (error) {
        console.error('Error fetching posts:', error)
        return []
      }
    },
  })

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text relative">
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* System Monitor - Stress Meter */}
          <Window title="System Monitor" path="/proc/stress">
            <StressMeter />
          </Window>

          {/* Processes - Posts */}
          <Window title="Process List" path="/proc/posts">
            <div className="flex justify-between items-center mb-4">
              <div className="font-mono text-sm text-terminal-accent">
                Active Processes: {posts?.length || 0}
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="terminal"
                size="sm"
              >
                + New Process
              </Button>
            </div>
            <div className="space-y-4">
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post: any) => (
                  <div
                    key={post.id}
                    className="border-b border-terminal-gray pb-4 last:border-0"
                  >
                    <PostCard post={post} />
                  </div>
                ))
              ) : (
                <div className="text-terminal-text-secondary text-center py-8 font-mono">
                  No posts found. Create your first post!
                </div>
              )}
            </div>
          </Window>
        </div>
      </main>
      <Footer />
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

