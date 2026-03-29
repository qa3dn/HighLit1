'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { api } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    username: string
    avatar_url?: string
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      await api.post(`/posts/${postId}/comments`, { content: newComment })
      const { data } = await api.get(`/posts/${postId}/comments`)
      setComments(data)
      setNewComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 border-t border-gray-dark pt-4" dir="rtl">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليق..."
            className="flex-1 bg-gray-light border border-gray-dark rounded-lg px-4 py-2 text-text placeholder:text-text-secondary focus:outline-none focus:border-accent"
            dir="rtl"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="bg-accent text-bg hover:bg-accent/90"
          >
            تعليق
          </Button>
        </div>
      </form>
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user.avatar_url || '/default-avatar.png'}
                alt={comment.user.username}
                className="w-8 h-8 rounded-full border border-gray-dark flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-text">
                    {comment.user.username}
                  </span>
                  <span className="text-text-secondary text-xs">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                </div>
                <p className="text-text-secondary text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-text-secondary text-sm text-center py-4">
            لا توجد تعليقات بعد
          </p>
        )}
      </div>
    </div>
  )
}

