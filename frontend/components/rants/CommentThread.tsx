'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { getComments } from '@/lib/api/posts'
import { useAddComment } from '@/hooks/usePosts'
import { playClickSound } from '@/lib/audio'

interface CommentThreadProps {
  postId: number
  isAuthenticated: boolean
}

export function CommentThread({ postId, isAuthenticated }: CommentThreadProps) {
  const [draft, setDraft] = useState('')
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    staleTime: 15_000,
  })
  const addComment = useAddComment(postId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    playClickSound()
    addComment.mutate(content, { onSuccess: () => setDraft('') })
  }

  return (
    <div className="mt-4 border-t border-gray-dark pt-4" dir="rtl">
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتب تعليقاً..."
            maxLength={5000}
            className="flex-1 rounded-lg border border-gray-dark bg-gray-light px-4 py-2 text-sm text-text outline-none transition-colors placeholder:text-text-secondary focus:border-accent"
          />
          <button
            type="submit"
            disabled={!draft.trim() || addComment.isPending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addComment.isPending ? '...' : 'تعليق'}
          </button>
        </form>
      ) : (
        <p className="mb-4 text-sm text-text-secondary">
          <a href="/login" className="text-accent hover:underline">
            سجّل دخول
          </a>{' '}
          للمشاركة في النقاش.
        </p>
      )}

      {isLoading ? (
        <p className="py-2 text-center text-sm text-text-secondary">جارٍ تحميل التعليقات...</p>
      ) : comments.length === 0 ? (
        <p className="py-2 text-center text-sm text-text-secondary">لا توجد تعليقات بعد. كن أول من يعلّق.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-dark bg-gray-light font-mono text-xs text-accent">
                {comment.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text">{comment.author.username}</span>
                  <span className="text-xs text-text-secondary">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ar })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-text-secondary">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
