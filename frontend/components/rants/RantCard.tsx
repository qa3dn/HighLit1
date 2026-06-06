'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { MessageSquare } from 'lucide-react'
import { Card } from '../ui/Card'
import { CommentThread } from './CommentThread'
import { ReactionsBar } from './ReactionsBar'
import { ShareMenu } from './ShareMenu'
import { playClickSound } from '@/lib/audio'
import { postPermalink } from '@/lib/share'
import type { Post } from '@/lib/api/posts'

interface RantCardProps {
  post: Post
  isAuthenticated: boolean
  /** 'detail' is the standalone permalink page: comments open, no hover, h1 title. */
  variant?: 'feed' | 'detail'
}

const ANON_NAMES = ['مكافح كود', 'مبرمج متعب', 'كود واريور', 'باغ هنتر', 'سنيور مجهول']
const ANON_AVATARS = ['👤', '👨‍💻', '👩‍💻', '🧑‍💻', '🤖']

function pickByIndex<T>(list: T[], seed: number): T {
  return list[seed % list.length]
}

/** Only allow http(s) links/images from user markdown — blocks javascript:/data:. */
function safeUrl(value: unknown): string | undefined {
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined
}

function HashtagText({ children }: { children: React.ReactNode }) {
  return (
    <>
      {Array.isArray(children)
        ? children.map((child, i) =>
            typeof child === 'string' ? <Highlighted key={i} text={child} /> : child,
          )
        : typeof children === 'string'
          ? <Highlighted text={children} />
          : children}
    </>
  )
}

function Highlighted({ text }: { text: string }) {
  // '#' followed by any run of non-space, non-'#' chars highlights Arabic and
  // Latin tags without the Unicode regex flag (unavailable under es5 target).
  const parts = text.split(/(#[^\s#]+)/)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <span key={i} className="font-medium text-accent">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

// react-markdown v10 no longer passes an `inline` prop, so block vs inline code
// is distinguished by the presence of a `language-*` class.
const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2">
      <HashtagText>{children}</HashtagText>
    </p>
  ),
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || '')
    const codeString = String(children).replace(/\n$/, '')
    return match ? (
      <div className="my-3 overflow-hidden rounded-lg border border-gray-dark">
        <div className="border-b border-gray-dark bg-gray-light px-3 py-1.5 font-mono text-xs text-text-secondary">
          {match[1]}
        </div>
        <SyntaxHighlighter
          language={match[1]}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem', background: '#1a1a1a' }}
          dir="ltr"
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="rounded border border-gray-dark bg-gray-light px-1.5 py-0.5 font-mono text-sm text-accent">
        {children}
      </code>
    )
  },
  img: ({ src, alt }) => {
    const safe = safeUrl(src)
    if (!safe) return null
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={safe}
        alt={alt ?? ''}
        className="my-3 max-h-96 w-full rounded-lg border border-gray-dark object-contain"
      />
    )
  },
  a: ({ href, children }) => {
    const safe = safeUrl(href)
    return safe ? (
      <a href={safe} target="_blank" rel="noopener noreferrer nofollow" className="text-accent hover:underline">
        {children}
      </a>
    ) : (
      <span>{children}</span>
    )
  },
}

export function RantCard({ post, isAuthenticated, variant = 'feed' }: RantCardProps) {
  const isDetail = variant === 'detail'
  const [showComments, setShowComments] = useState(isDetail)

  const displayName = post.is_anonymous
    ? pickByIndex(ANON_NAMES, post.id)
    : post.author?.username ?? 'مستخدم'
  const avatar = post.is_anonymous ? pickByIndex(ANON_AVATARS, post.id) : null
  const permalink = `/rants/${post.id}`
  const shareTitle = post.title || `فضفضة من ${displayName} على HighLit`

  const relativeTime = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ar })

  const handleToggleComments = () => {
    playClickSound()
    setShowComments((open) => !open)
  }

  return (
    <Card
      className={`mb-4 transition-colors ${isDetail ? 'border-gray-dark' : 'border-gray-dark hover:border-accent/40'}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-dark bg-gray-light text-lg">
          {avatar ?? (
            <span className="font-mono text-sm text-accent">{(displayName || '?').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {post.is_anonymous ? (
              <span className="truncate font-semibold text-text">{displayName}</span>
            ) : (
              <Link
                href={`/profile/${post.user_id}`}
                className="truncate font-semibold text-text transition-colors hover:text-accent hover:underline"
              >
                {displayName}
              </Link>
            )}
            {!post.is_anonymous && post.author?.rank && (
              <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                {post.author.rank}
              </span>
            )}
            {post.is_anonymous && (
              <span className="rounded border border-gray-dark px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                مجهول
              </span>
            )}
          </div>
          {isDetail ? (
            <span className="font-mono text-xs text-text-secondary">{relativeTime}</span>
          ) : (
            <Link href={permalink} className="font-mono text-xs text-text-secondary transition-colors hover:text-accent">
              {relativeTime}
            </Link>
          )}
        </div>
      </div>

      {/* Title */}
      {post.title &&
        (isDetail ? (
          <h1 className="mb-2 text-xl font-bold text-text">{post.title}</h1>
        ) : (
          <Link href={permalink}>
            <h3 className="mb-2 text-lg font-bold text-text transition-colors hover:text-accent">{post.title}</h3>
          </Link>
        ))}

      {/* Content */}
      <div className="mb-3 leading-relaxed text-text">
        <ReactMarkdown components={markdownComponents}>{post.content}</ReactMarkdown>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-dark bg-gray-light px-2.5 py-0.5 font-mono text-xs text-accent"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reactions (full community set) */}
      <div className="border-t border-gray-dark pt-3">
        <ReactionsBar
          postId={post.id}
          reactions={post.reactions}
          viewerReactions={post.viewer_reactions}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Comment / share */}
      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          onClick={handleToggleComments}
          aria-expanded={showComments}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            showComments ? 'bg-gray-light text-text' : 'text-text-secondary hover:bg-gray-light hover:text-text'
          }`}
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          <span>{post.comment_count}</span>
        </button>

        <ShareMenu url={postPermalink(post.id)} title={shareTitle} />
      </div>

      {showComments && <CommentThread postId={post.id} isAuthenticated={isAuthenticated} />}
    </Card>
  )
}
