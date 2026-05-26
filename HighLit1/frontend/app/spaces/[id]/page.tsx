'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Window } from '@/components/terminal/Window'
import { AudioSpacePlayer } from '@/components/spaces/AudioSpacePlayer'
import { Whiteboard } from '@/components/spaces/Whiteboard'
import { api } from '@/lib/api'

export default function SpaceDetailPage() {
  const params = useParams()
  const spaceId = params.id as string
  const userId = 'user-id' // This should come from auth context

  const { data: space } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: async () => {
      const { data } = await api.get(`/spaces/${spaceId}`)
      return data
    },
  })

  if (!space) {
    return (
      <div className="min-h-screen bg-terminal-bg text-terminal-text flex items-center justify-center">
        <div className="font-mono text-terminal-accent">Loading session...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text relative">
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Session Info */}
          <Window title="Session Info" path="/sessions">
            <div className="font-mono text-sm">
              <div className="text-terminal-accent mb-2">Session ID:</div>
              <div className="text-terminal-text mb-4">{spaceId}</div>
              <div className="text-terminal-accent mb-2">Title:</div>
              <div className="text-terminal-text">{space.title}</div>
            </div>
          </Window>

          {/* Audio Controls */}
          <Window title="Audio Controls" path="/sessions/audio">
            <AudioSpacePlayer spaceId={spaceId} userId={userId} />
          </Window>

          {/* Whiteboard */}
          <Window title="Terminal Drawing" path="/sessions/whiteboard">
            <Whiteboard spaceId={spaceId} />
          </Window>
        </div>
      </main>
      <Footer />
    </div>
  )
}

