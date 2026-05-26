'use client'

import { TrendingUp, X } from 'lucide-react'
import { Card } from '../ui/Card'
import { useTags } from '@/hooks/useTags'
import { playClickSound } from '@/lib/audio'

interface TagsSidebarProps {
  onTagSelect: (tag: string) => void
  selectedTag?: string
}

export function TagsSidebar({ onTagSelect, selectedTag }: TagsSidebarProps) {
  const { data: tags = [] } = useTags()

  return (
    <Card className="sticky top-20 border-gray-dark p-5" dir="rtl">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h2 className="font-mono text-lg font-bold text-text">وين الوجع؟</h2>
      </div>

      {selectedTag && (
        <button
          onClick={() => {
            playClickSound()
            onTagSelect(selectedTag)
          }}
          className="mb-3 flex w-full items-center justify-between rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent"
        >
          <span className="font-mono">#{selectedTag}</span>
          <span className="flex items-center gap-1 text-xs">
            <X className="h-3.5 w-3.5" />
            عرض الكل
          </span>
        </button>
      )}

      <ul className="space-y-1">
        {tags.map((item, index) => {
          const isActive = selectedTag === item.tag
          return (
            <li key={item.tag}>
              <button
                onClick={() => {
                  playClickSound()
                  onTagSelect(item.tag)
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-right transition-colors ${
                  isActive ? 'bg-accent/15' : 'hover:bg-gray-light'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] text-text-secondary">ترند #{index + 1}</div>
                  <div
                    className={`truncate font-mono text-sm ${
                      isActive ? 'text-accent' : 'text-text group-hover:text-accent'
                    }`}
                  >
                    #{item.tag}
                  </div>
                  <div className="text-[11px] text-text-secondary">
                    {item.count > 0 ? `${item.count} فضفضة` : 'جديد'}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
