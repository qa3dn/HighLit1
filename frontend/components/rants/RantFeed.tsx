'use client'

import { useState } from 'react'
import { Flame, Clock, MessageSquare } from 'lucide-react'
import { RantCard } from './RantCard'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'

interface RantFeedProps {
  rants: any[]
  sort: string
  onSortChange: (sort: string) => void
}

export function RantFeed({ rants, sort, onSortChange }: RantFeedProps) {
  const sortOptions = [
    { value: 'most_solidarity', label: 'الأكثر تضامنًا', icon: Flame },
    { value: 'recent', label: 'الأحدث', icon: Clock },
    { value: 'most_comments', label: 'الأكثر نقاشًا', icon: MessageSquare },
  ]

  return (
    <div dir="rtl">
      {/* Sort Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-dark">
        {sortOptions.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.value}
              onClick={() => {
                playClickSound()
                onSortChange(option.value)
              }}
              className={`px-4 py-2 font-mono text-sm transition-all border-b-2 flex items-center gap-2 ${
                sort === option.value
                  ? 'text-accent border-accent'
                  : 'text-text-secondary border-transparent hover:text-text hover:border-gray-dark'
              }`}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </button>
          )
        })}
      </div>

      {/* Feed */}
      <div>
        {rants && rants.length > 0 ? (
          rants.map((rant) => <RantCard key={rant.id} post={rant} />)
        ) : (
          <div className="text-center py-12 text-text-secondary font-mono">
            <p className="text-lg mb-2">ما في فضفضات حالياً</p>
            <p className="text-sm">كن أول واحد يفضفض!</p>
          </div>
        )}
      </div>
    </div>
  )
}

