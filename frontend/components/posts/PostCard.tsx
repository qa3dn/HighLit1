'use client'

import { Card } from '../ui/Card'
import { ReactionsBar } from './ReactionsBar'
import { CommentSection } from './CommentSection'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Post {
  id: string
  content: string
  type: string
  is_anonymous: boolean
  created_at: string
  user?: {
    username: string
    avatar_url?: string
  }
  reactions?: any[]
  comments?: any[]
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="mb-6">
      <div className="flex items-start gap-4 mb-4">
        {post.is_anonymous ? (
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
        ) : (
          <img
            src={post.user?.avatar_url || '/default-avatar.png'}
            alt={post.user?.username}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">
              {post.is_anonymous ? 'مجهول' : post.user?.username}
            </span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ar,
              })}
            </span>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>
      <ReactionsBar postId={post.id} reactions={post.reactions || []} />
      <CommentSection postId={post.id} comments={post.comments || []} />
    </Card>
  )
}

