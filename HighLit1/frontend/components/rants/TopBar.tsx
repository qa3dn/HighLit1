'use client'

import { useState } from 'react'
import { PenTool, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'
import { SearchBar } from './SearchBar'
import { FilterBar } from './FilterBar'

interface TopBarProps {
  onSearch: (query: string) => void
  onFilter: (filters: any) => void
  onCreateRant: () => void
}

export function TopBar({ onSearch, onFilter, onCreateRant }: TopBarProps) {
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)

  return (
    <div className="bg-bg border-b border-gray-dark py-6 mb-6" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Title and Description */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-2">
            فش غلك
          </h1>
          <p className="text-text-secondary text-lg">
            احكي اللي بقلبك… بدون ما تشرح من الصفر.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              playClickSound()
              onCreateRant()
            }}
            className="bg-accent text-bg hover:bg-accent/90 font-mono"
          >
            <PenTool className="w-4 h-4 ml-2" />
            فش غلك
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              playClickSound()
              setShowSearch(!showSearch)
              setShowFilter(false)
            }}
            className="border border-gray-dark hover:border-accent font-mono"
          >
            <Search className="w-4 h-4 ml-2" />
            بحث
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              playClickSound()
              setShowFilter(!showFilter)
              setShowSearch(false)
            }}
            className="border border-gray-dark hover:border-accent font-mono"
          >
            <SlidersHorizontal className="w-4 h-4 ml-2" />
            فلترة
          </Button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4">
            <SearchBar onSearch={onSearch} />
          </div>
        )}

        {/* Filter Bar */}
        {showFilter && (
          <div className="mt-4">
            <FilterBar onFilter={onFilter} />
          </div>
        )}
      </div>
    </div>
  )
}

