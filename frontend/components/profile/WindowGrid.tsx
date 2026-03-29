'use client'

import { Window } from '../terminal/Window'
import Link from 'next/link'
import { playClickSound } from '@/lib/audio'

interface WindowGridProps {
  recentPosts: Array<{
    id: string
    content: string
    type: string
  }>
  recentCodes: Array<{
    id: string
    language: string
  }>
}

export function WindowGrid({ recentPosts, recentCodes }: WindowGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Recent Posts Window */}
      <Window title="Recent Rants" path="~/rants" className="h-64">
        <div className="space-y-2 font-mono text-xs">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/rants/${post.id}`}
                onClick={playClickSound}
                className="block p-2 hover:bg-terminal-gray border border-transparent hover:border-terminal-accent transition-all"
              >
                <div className="text-terminal-accent mb-1">
                  [{post.type}] {post.id.substring(0, 8)}
                </div>
                <div className="text-terminal-text line-clamp-2">
                  {post.content.substring(0, 100)}...
                </div>
              </Link>
            ))
          ) : (
            <div className="text-terminal-gray text-center py-8">
              No rants yet
            </div>
          )}
        </div>
      </Window>

      {/* Recent Codes Window */}
      <Window title="Recent Code" path="~/code" className="h-64">
        <div className="space-y-2 font-mono text-xs">
          {recentCodes.length > 0 ? (
            recentCodes.map((code) => (
              <Link
                key={code.id}
                href={`/code/${code.id}`}
                onClick={playClickSound}
                className="block p-2 hover:bg-terminal-gray border border-transparent hover:border-terminal-accent transition-all"
              >
                <div className="text-terminal-accent mb-1">
                  [{code.language}] {code.id.substring(0, 8)}
                </div>
                <div className="text-terminal-text">View code →</div>
              </Link>
            ))
          ) : (
            <div className="text-terminal-gray text-center py-8">
              No code yet
            </div>
          )}
        </div>
      </Window>
    </div>
  )
}

