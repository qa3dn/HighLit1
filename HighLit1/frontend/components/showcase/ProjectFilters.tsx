'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { ProjectFilters as Filters, ProjectType } from '@/lib/api/studentProjects'
import { PROJECT_TYPE_LABELS } from '@/lib/showcase/constants'
import { playClickSound } from '@/lib/audio'

const TYPE_OPTIONS: { value: ProjectType | ''; label: string }[] = [
  { value: '', label: 'الكل' },
  { value: 'IMAGE', label: 'صور' },
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'VIDEO', label: 'فيديو' },
  { value: 'MIXED', label: 'مختلط' },
]

interface ProjectFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  universities: string[]
  majors: string[]
}

export function ProjectFiltersBar({
  filters,
  onChange,
  universities,
  majors,
}: ProjectFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const update = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch })
  }

  const filterFields = (
    <>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="search"
          placeholder="ابحث عن مشروع..."
          value={filters.q || ''}
          onChange={(e) => update({ q: e.target.value || undefined })}
          className="w-full rounded-xl border border-gray-dark bg-gray-light py-2.5 pl-3 pr-10 text-sm text-text outline-none focus:border-accent"
          dir="rtl"
        />
      </div>
      <select
        value={filters.university || ''}
        onChange={(e) => update({ university: e.target.value || undefined })}
        className="rounded-xl border border-gray-dark bg-gray-light px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        dir="rtl"
      >
        <option value="">كل الجامعات</option>
        {universities.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <select
        value={filters.major || ''}
        onChange={(e) => update({ major: e.target.value || undefined })}
        className="rounded-xl border border-gray-dark bg-gray-light px-3 py-2.5 text-sm text-text outline-none focus:border-accent"
        dir="rtl"
      >
        <option value="">كل التخصصات</option>
        {majors.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => {
              playClickSound()
              update({ project_type: opt.value || undefined })
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (filters.project_type || '') === opt.value
                ? 'bg-accent text-bg'
                : 'border border-gray-dark bg-gray-light text-text-secondary hover:border-accent/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  )

  return (
    <div className="sticky top-14 z-40 border-b border-white/10 bg-bg/90 py-3 backdrop-blur-xl sm:top-16" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="hidden flex-wrap items-center gap-3 lg:flex">{filterFields}</div>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              placeholder="ابحث..."
              value={filters.q || ''}
              onChange={(e) => update({ q: e.target.value || undefined })}
              className="w-full rounded-xl border border-gray-dark bg-gray-light py-2 pl-3 pr-9 text-sm"
              dir="rtl"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound()
              setMobileOpen(!mobileOpen)
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-dark bg-gray-light"
            aria-label="فلاتر"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-3 flex flex-col gap-3 border-t border-gray-dark pt-3 lg:hidden">
            {filterFields}
          </div>
        )}
      </div>
    </div>
  )
}
