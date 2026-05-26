'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/Input'
import { playClickSound } from '@/lib/audio'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" dir="rtl">
      <div className="flex-1 relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الفضفضات..."
          className="w-full"
          variant="terminal"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-accent text-bg hover:bg-accent/90 transition-colors rounded font-mono flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        بحث
      </button>
    </form>
  )
}

