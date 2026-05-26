import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { mergeWithSuggested, type TagCount } from '@/lib/rants/tags'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get<TagCount[]>('/posts/tags')
      return mergeWithSuggested(Array.isArray(data) ? data : [])
    },
    staleTime: 60_000,
  })
}
