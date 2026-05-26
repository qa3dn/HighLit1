'use client'

import Link from 'next/link'
import { Card } from '../ui/Card'
import { ReactionsBar } from './ReactionsBar'
import { CommentSection } from './CommentSection'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Post {
  id: number | string
  content: string
  type: string
  is_anonymous: boolean
  created_at: string
  author?: {
    id: number
    username: string
    avatar_url?: string
    rank?: string
  } | null
  reaction_count?: number
  comment_count?: number
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const displayName = post.is_anonymous ? 'مجهول' : post.author?.username ?? 'مستخدم'

  return (
    <Card className="mb-6" dir="rtl">
      <div className="mb-4 flex items-start gap-4">
        {post.is_anonymous || !post.author?.avatar_url ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-dark bg-gray-light font-mono text-sm text-accent">
            {post.is_anonymous ? '👤' : displayName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <img
            src={post.author.avatar_url}
            alt={displayName}
            className="h-10 w-10 rounded-full border border-gray-dark"
          />
        )}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {post.is_anonymous || !post.author?.id ? (
              <span className="font-semibold text-text">{displayName}</span>
            ) : (
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold text-text transition-colors hover:text-accent hover:underline"
              >
                {displayName}
              </Link>
            )}
            {!post.is_anonymous && post.author?.rank && (
              <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                {post.author.rank}
              </span>
            )}
            <span className="text-sm text-text-secondary">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ar })}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-text-secondary">{post.content}</p>
        </div>
      </div>
      <ReactionsBar postId={post.id} reactions={[]} />
      <CommentSection postId={post.id} comments={[]} />
    </Card>
  )
}
