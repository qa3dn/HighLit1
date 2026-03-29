'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

const reactions = [
  { type: 'FEEL_YOU', label: 'صار معي', emoji: '😔' },
  { type: 'TAKE_A_BREAK', label: 'اطلع بريك', emoji: '☕' },
  { type: 'GOD_HELP_YOU', label: 'الله يعينك', emoji: '🤲' },
  { type: 'WORKS_FOR_ME', label: 'كودك شغال عندي', emoji: '✅' },
]

interface ReactionsBarProps {
  postId: string
  reactions: any[]
}

export function ReactionsBar({ postId, reactions: initialReactions }: ReactionsBarProps) {
  const [reactionsList, setReactionsList] = useState(initialReactions)

  const handleReaction = async (type: string) => {
    try {
      await api.post(`/posts/${postId}/reactions`, { type })
      // Refresh reactions
      const { data } = await api.get(`/posts/${postId}/reactions`)
      setReactionsList(data)
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  const getReactionCount = (type: string) => {
    return reactionsList.filter((r) => r.type === type).length
  }

  return (
    <div className="flex gap-4 py-3 border-t border-gray-800">
      {reactions.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => handleReaction(reaction.type)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span>{reaction.emoji}</span>
          <span className="text-sm">{reaction.label}</span>
          {getReactionCount(reaction.type) > 0 && (
            <span className="text-xs text-gray-500">
              {getReactionCount(reaction.type)}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

