'use client'

import { useState } from 'react'
import { Trash2, FileText, Code, Lightbulb, Filter } from 'lucide-react'
import { Window } from '@/components/terminal/Window'
import { playClickSound } from '@/lib/audio'
import { useSavedItems, useUnsaveItem } from '@/hooks/useRoom'

interface SavedItemsProps {
  isOwnProfile: boolean
}

type FilterType = 'all' | 'POST' | 'CODE' | 'IDEA'

export function SavedItems({ isOwnProfile }: SavedItemsProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const { data: savedItems = [], isLoading } = useSavedItems()
  const unsaveMutation = useUnsaveItem()

  if (!isOwnProfile) {
    return null // Saved items are always private
  }

  const filteredItems = savedItems.filter((item) => {
    if (filter === 'all') return true
    return item.item_type === filter
  })

  const handleUnsave = async (itemType: string, itemId: string) => {
    if (confirm('هل أنت متأكد من إزالة هذا العنصر من المحفوظات؟')) {
      playClickSound()
      await unsaveMutation.mutateAsync({ itemType, itemId })
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'POST':
        return <FileText className="w-4 h-4" />
      case 'CODE':
        return <Code className="w-4 h-4" />
      case 'IDEA':
        return <Lightbulb className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Window title="المحفوظات" path="~/saved">
        <div className="text-text-secondary text-center py-8 font-mono">
          جاري التحميل...
        </div>
      </Window>
    )
  }

  return (
    <Window title="المحفوظات" path="~/saved">
      <div className="space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-text-secondary" />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'POST', 'CODE', 'IDEA'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded font-mono text-sm transition-all ${
                  filter === f
                    ? 'bg-accent text-bg'
                    : 'bg-gray text-text hover:bg-accent hover:text-bg'
                }`}
              >
                {f === 'all'
                  ? 'الكل'
                  : f === 'POST'
                  ? 'فضفضات'
                  : f === 'CODE'
                  ? 'كود'
                  : 'أفكار'}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-text-secondary text-center py-12 font-mono">
            {filter === 'all' ? (
              <>
                <p className="mb-4">لا توجد محفوظات بعد</p>
                <p className="text-sm">احفظ العناصر التي تعجبك!</p>
              </>
            ) : (
              <p>لا توجد محفوظات بهذا النوع</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray rounded-lg p-4 bg-bg hover:border-accent transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-accent mt-1">
                      {getItemIcon(item.item_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-text-secondary px-2 py-1 bg-gray rounded">
                          {item.item_type}
                        </span>
                        <span className="text-xs font-mono text-text-secondary">
                          {item.item_id.substring(0, 8)}...
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-text-secondary mt-2">
                          {item.notes}
                        </p>
                      )}
                      <div className="text-xs text-text-secondary font-mono mt-2">
                        {new Date(item.created_at).toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(item.item_type, item.item_id)}
                    className="p-1 hover:bg-gray rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Window>
  )
}

