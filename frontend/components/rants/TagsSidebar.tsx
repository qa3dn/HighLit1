'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { playClickSound } from '@/lib/audio'
import { Card } from '../ui/Card'

interface TagsSidebarProps {
  onTagSelect: (tag: string) => void
  selectedTag?: string
}

export function TagsSidebar({ onTagSelect, selectedTag }: TagsSidebarProps) {
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get('/posts/tags')
      return data
    },
  })

  const defaultTags = [
    { name: 'عميل_راسُه_يابس', slug: 'عميل_راسُه_يابس' },
    { name: 'الكود_كان_شغال', slug: 'الكود_كان_شغال' },
    { name: 'قبل_الديمو', slug: 'قبل_الديمو' },
    { name: 'CSS_ليش', slug: 'CSS_ليش' },
    { name: 'اجتماع_ما_اله_داعي', slug: 'اجتماع_ما_اله_داعي' },
    { name: 'ديبلوي_فاشل', slug: 'ديبلوي_فاشل' },
    { name: 'تعبت_والله', slug: 'تعبت_والله' },
  ]

  const displayTags = (tags && Array.isArray(tags) && tags.length > 0) ? tags : defaultTags

  return (
    <Card className="p-6 sticky top-20 border-gray-dark" dir="rtl">
      <h2 className="text-xl font-bold text-text mb-4 font-mono">وين الوجع؟</h2>
      <div className="space-y-2">
        {displayTags.map((tag: any) => (
          <button
            key={tag.slug || tag.name}
            onClick={() => {
              playClickSound()
              onTagSelect(tag.slug || tag.name)
            }}
            className={`w-full text-right px-4 py-2 rounded-lg transition-all font-mono text-sm ${
              selectedTag === (tag.slug || tag.name)
                ? 'bg-accent text-bg font-semibold border border-accent'
                : 'bg-gray-light text-text hover:bg-gray border border-gray-dark hover:border-accent/50'
            }`}
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </Card>
  )
}

