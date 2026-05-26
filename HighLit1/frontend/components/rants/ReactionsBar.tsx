'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Repeat, Coffee, Brain } from 'lucide-react'
import { useToggleReaction } from '@/hooks/usePosts'
import { playClickSound } from '@/lib/audio'

interface ReactionsBarProps {
  postId: number
  reactions: { type: string; count: number }[]
  viewerReactions: string[]
  isAuthenticated: boolean
}

const REACTION_TYPES = [
  { type: 'FEEL_YOU', label: 'حاسس فيك', icon: Heart },
  { type: 'HAPPENED_TO_ME', label: 'صار معي', icon: Repeat },
  { type: 'TAKE_A_BREAK', label: 'خذ بريك', icon: Coffee },
  { type: 'HELP_ME', label: 'حلّيلي؟', icon: Brain },
] as const

function toCountMap(reactions: { type: string; count: number }[]): Record<string, number> {
  const map: Record<string, number> = {}
  reactions.forEach((reaction) => {
    map[reaction.type] = reaction.count
  })
  return map
}

export function ReactionsBar({ postId, reactions, viewerReactions, isAuthenticated }: ReactionsBarProps) {
  const router = useRouter()
  const [counts, setCounts] = useState<Record<string, number>>(() => toCountMap(reactions))
  const [active, setActive] = useState<Set<string>>(() => new Set(viewerReactions))
  const toggle = useToggleReaction()

  const handleReaction = (type: string) => {
    if (!isAuthenticated) {
      router.push('/login?next=/rants')
      return
    }
    playClickSound()
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40)
    }

    const wasActive = active.has(type)
    // Optimistic update; reconciled with the server's authoritative totals.
    setActive((prev) => {
      const next = new Set(prev)
      if (wasActive) next.delete(type)
      else next.add(type)
      return next
    })
    setCounts((prev) => ({ ...prev, [type]: Math.max((prev[type] || 0) + (wasActive ? -1 : 1), 0) }))

    toggle.mutate(
      { postId, type },
      {
        onSuccess: (data) => {
          setCounts(toCountMap(data.totals))
          setActive((prev) => {
            const next = new Set(prev)
            if (data.reacted) next.add(type)
            else next.delete(type)
            return next
          })
        },
        onError: () => {
          setActive((prev) => {
            const next = new Set(prev)
            if (wasActive) next.add(type)
            else next.delete(type)
            return next
          })
          setCounts((prev) => ({
            ...prev,
            [type]: Math.max((prev[type] || 0) + (wasActive ? 1 : -1), 0),
          }))
        },
      },
    )
  }

  return (
    <div className="flex flex-wrap gap-2" dir="rtl">
      {REACTION_TYPES.map((reaction) => {
        const Icon = reaction.icon
        const count = counts[reaction.type] || 0
        const isActive = active.has(reaction.type)
        return (
          <button
            key={reaction.type}
            type="button"
            onClick={() => handleReaction(reaction.type)}
            aria-pressed={isActive}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-gray-dark bg-gray-light text-text-secondary hover:border-accent/50 hover:text-text'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'fill-accent' : ''}`} />
            <span>{reaction.label}</span>
            {count > 0 && (
              <span className="rounded-full bg-gray px-1.5 text-xs text-text-secondary">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
