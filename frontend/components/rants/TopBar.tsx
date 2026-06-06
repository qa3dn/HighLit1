'use client'

import { useState } from 'react'
import { PenTool, Search } from 'lucide-react'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'
import { SearchBar } from './SearchBar'

interface TopBarProps {
  onSearch: (query: string) => void
  onCreateRant: () => void
}

export function TopBar({ onSearch, onCreateRant }: TopBarProps) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <div className="mb-6 border-b border-gray-dark py-6" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Title and Description */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-text md:text-4xl">فش غلك</h1>
          <p className="text-lg text-text-secondary">احكي اللي بقلبك… بدون ما تشرح من الصفر.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              playClickSound()
              onCreateRant()
            }}
            className="bg-accent font-mono text-bg hover:bg-accent-hover"
          >
            <PenTool className="me-2 h-4 w-4" aria-hidden />
            فش غلك
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              playClickSound()
              setShowSearch((s) => !s)
            }}
            aria-expanded={showSearch}
            className="border border-gray-dark font-mono hover:border-accent"
          >
            <Search className="me-2 h-4 w-4" aria-hidden />
            بحث
          </Button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4">
            <SearchBar onSearch={onSearch} />
          </div>
        )}
      </div>
    </div>
  )
}
