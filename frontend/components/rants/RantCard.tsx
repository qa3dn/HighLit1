'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Card } from '../ui/Card'
import { ReactionsBar } from './ReactionsBar'
import { CommentSection } from '../posts/CommentSection'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Copy, Check } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

interface RantCardProps {
  post: {
    id: string
    content: string
    is_anonymous: boolean
    created_at: string
    user?: {
      username: string
      avatar_url?: string
    }
    tags?: Array<{ name: string; slug: string }>
    reactions?: any[]
    comments?: any[]
  }
}

const anonymousNames = [
  'مكافح كود',
  'مبرمج مكافح',
  'مطور متعب',
  'كود واريور',
  'باغ هانتر',
]

const getRandomName = (id: string) => {
  const index = parseInt(id.substring(0, 2), 16) % anonymousNames.length
  return anonymousNames[index]
}

const getRandomAvatar = (id: string) => {
  const avatars = ['👤', '👨‍💻', '👩‍💻', '🧑‍💻', '🤖']
  const index = parseInt(id.substring(2, 4), 16) % avatars.length
  return avatars[index]
}

export function RantCard({ post }: RantCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const displayName = post.is_anonymous
    ? getRandomName(post.id)
    : post.user?.username || 'مجهول'
  const avatar = post.is_anonymous ? getRandomAvatar(post.id) : null
  const primaryTag = post.tags && post.tags.length > 0 ? post.tags[0] : null

  const handleCopyCode = (code: string, index: number) => {
    playClickSound()
    navigator.clipboard.writeText(code)
    setCopiedCode(`${index}`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <Card className="mb-6 hover:border-accent/50 transition-all border-gray-dark" dir="rtl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {post.is_anonymous ? (
          <div className="w-12 h-12 rounded-full bg-gray-light border border-gray-dark flex items-center justify-center text-2xl flex-shrink-0 font-mono">
            {avatar}
          </div>
        ) : (
          <img
            src={post.user?.avatar_url || '/default-avatar.png'}
            alt={post.user?.username}
            className="w-12 h-12 rounded-full border border-gray-dark flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-text font-mono">{displayName}</span>
            {primaryTag && (
              <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent border border-accent/50 font-mono">
                #{primaryTag.name}
              </span>
            )}
          </div>
          <span className="text-text-secondary text-sm font-mono">
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ar,
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="mb-2 text-text leading-relaxed">{children}</p>
            ),
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '')
              const codeString = String(children).replace(/\n$/, '')
              const codeIndex = Math.random().toString(36).substring(7)

              return !inline && match ? (
                <div className="relative my-4 border border-gray-dark rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-light px-4 py-2 border-b border-gray-dark">
                    <span className="text-xs text-text-secondary font-mono">
                      {match[1]}
                    </span>
                    <button
                      onClick={() => handleCopyCode(codeString, codeIndex as any)}
                      className="p-1 hover:bg-gray rounded transition-colors"
                    >
                      {copiedCode === codeIndex ? (
                        <Check className="w-4 h-4 text-accent" />
                      ) : (
                        <Copy className="w-4 h-4 text-text-secondary" />
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={match[1]}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: '#1a1a1a',
                    }}
                    dir="ltr"
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code
                  className="bg-gray-light px-2 py-1 rounded text-accent font-mono text-sm border border-gray-dark"
                  {...props}
                >
                  {children}
                </code>
              )
            },
            img: ({ src, alt }) => (
              <div className="my-4 border border-gray-dark rounded-lg overflow-hidden">
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto max-h-96 object-contain bg-gray-light"
                />
              </div>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-mono"
              >
                {children}
              </a>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Reactions */}
      <ReactionsBar
        postId={post.id}
        reactions={post.reactions || []}
        onReactionUpdate={() => {
          // Refresh post data if needed
        }}
      />

      {/* Comments */}
      <div className="mt-4">
        <button
          onClick={() => {
            playClickSound()
            setShowComments(!showComments)
          }}
          className="text-text-secondary text-sm hover:text-accent transition-colors font-mono"
        >
          {showComments ? 'إخفاء التعليقات' : 'عرض التعليقات'}
        </button>
        {showComments && (
          <div className="mt-2">
            <CommentSection
              postId={post.id}
              comments={post.comments || []}
            />
          </div>
        )}
      </div>
    </Card>
  )
}
