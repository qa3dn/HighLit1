import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  addComment,
  createPost,
  getFeed,
  toggleReaction,
  type CreatePostPayload,
  type FeedParams,
  type FeedResponse,
} from '@/lib/api/posts'

const FEED_LIMIT = 20

export function useFeed(params: Omit<FeedParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['feed', params],
    queryFn: ({ pageParam }) => getFeed({ ...params, page: pageParam, limit: FEED_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (last: FeedResponse) => (last.has_more ? last.page + 1 : undefined),
    staleTime: 30_000,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['daily-stats'] })
    },
  })
}

export function useToggleReaction() {
  return useMutation({
    mutationFn: ({ postId, type }: { postId: number; type: string }) =>
      toggleReaction(postId, type),
  })
}

export function useAddComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => addComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })
}
