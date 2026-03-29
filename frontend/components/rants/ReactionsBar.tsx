'use client'

import { useState } from 'react'
import { Heart, Repeat, Coffee, Brain } from 'lucide-react'
import { api } from '@/lib/api'
import { playClickSound } from '@/lib/audio'

interface ReactionsBarProps {
  postId: string
  reactions: any[]
  onReactionUpdate?: () => void
}

const reactionTypes = [
  { type: 'FEEL_YOU', label: 'حاس فيك', icon: Heart },
  { type: 'HAPPENED_TO_ME', label: 'صار معي', icon: Repeat },
  { type: 'TAKE_A_BREAK', label: 'خذ بريك', icon: Coffee },
  { type: 'HELP_ME', label: 'حلّيلي؟', icon: Brain },
]

export function ReactionsBar({
  postId,
  reactions: initialReactions,
  onReactionUpdate,
}: ReactionsBarProps) {
  const [reactionsList, setReactionsList] = useState(initialReactions || [])
  const [isLoading, setIsLoading] = useState(false)

  const handleReaction = async (type: string) => {
    if (isLoading) return

    playClickSound()

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    setIsLoading(true)
    try {
      await api.post(`/posts/${postId}/reactions`, { type })
      // Refresh reactions
      const { data } = await api.get(`/posts/${postId}/reactions`)
      setReactionsList(data)
      if (onReactionUpdate) {
        onReactionUpdate()
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getReactionCount = (type: string) => {
    return reactionsList.filter((r) => r.type === type).length
  }

  const hasUserReacted = (type: string) => {
    // Check if current user has reacted (would need user context)
    return false
  }

  return (
    <div className="flex flex-wrap gap-2 py-3 border-t border-gray-dark" dir="rtl">
      {reactionTypes.map((reaction) => {
        const count = getReactionCount(reaction.type)
        const isActive = hasUserReacted(reaction.type)
        const Icon = reaction.icon

        return (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            disabled={isLoading}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-mono ${
              isActive
                ? 'bg-accent/20 text-accent border border-accent'
                : 'bg-gray-light text-text hover:bg-gray border border-gray-dark hover:border-accent/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'fill-accent' : ''}`} />
            <span className="text-sm font-medium">{reaction.label}</span>
            {count > 0 && (
              <span className="text-xs text-text-secondary bg-gray rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

