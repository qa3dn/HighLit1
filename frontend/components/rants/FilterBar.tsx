'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'

interface FilterBarProps {
  onFilter: (filters: { tags?: string[]; reactions?: string[] }) => void
}

export function FilterBar({ onFilter }: FilterBarProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedReactions, setSelectedReactions] = useState<string[]>([])

  const handleTagToggle = (tag: string) => {
    playClickSound()
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)
    onFilter({ tags: newTags, reactions: selectedReactions })
  }

  const handleReactionToggle = (reaction: string) => {
    playClickSound()
    const newReactions = selectedReactions.includes(reaction)
      ? selectedReactions.filter((r) => r !== reaction)
      : [...selectedReactions, reaction]
    setSelectedReactions(newReactions)
    onFilter({ tags: selectedTags, reactions: newReactions })
  }

  const clearFilters = () => {
    playClickSound()
    setSelectedTags([])
    setSelectedReactions([])
    onFilter({ tags: [], reactions: [] })
  }

  return (
    <div className="flex flex-wrap items-center gap-2" dir="rtl">
      <span className="text-text-secondary text-sm font-mono">فلترة بالوسوم:</span>
      {['#عميل_راسُه_يابس', '#الكود_كان_شغال', '#قبل_الديمو'].map((tag) => (
        <Button
          key={tag}
          variant={selectedTags.includes(tag) ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleTagToggle(tag)}
          className={`font-mono ${
            selectedTags.includes(tag)
              ? 'bg-accent text-bg'
              : 'border border-gray-dark hover:border-accent'
          }`}
        >
          {tag}
        </Button>
      ))}

      {(selectedTags.length > 0 || selectedReactions.length > 0) && (
        <Button
          variant="secondary"
          size="sm"
          onClick={clearFilters}
          className="border border-gray-dark text-text-secondary font-mono flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          مسح الفلاتر
        </Button>
      )}
    </div>
  )
}

