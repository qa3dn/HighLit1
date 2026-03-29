'use client'

import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'
import { api } from '@/lib/api'

interface LogEntryProps {
  post: {
    id: string
    content: string
    is_anonymous: boolean
    created_at: string
    user?: {
      username: string
    }
  }
}

const getLogLevel = (content: string): string => {
  const lowerContent = content.toLowerCase()
  if (lowerContent.includes('مشكلة') || lowerContent.includes('error') || lowerContent.includes('crash')) {
    return 'CRITICAL'
  }
  if (lowerContent.includes('ضغط') || lowerContent.includes('stress') || lowerContent.includes('deadline')) {
    return 'WARNING'
  }
  return 'INFO'
}

export function LogEntry({ post }: LogEntryProps) {
  const level = getLogLevel(post.content)
  const timestamp = new Date(post.created_at)
  const timeStr = timestamp.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const dateStr = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const username = post.is_anonymous
    ? `anonymous_${post.id.substring(0, 8)}`
    : post.user?.username || 'unknown'

  const levelColors = {
    CRITICAL: 'text-red-400',
    WARNING: 'text-yellow-400',
    INFO: 'text-terminal-accent',
  }

  const handleReaction = async (command: string) => {
    playClickSound()
    try {
      const reactionMap: Record<string, string> = {
        '--fsh_ghalil': 'FEEL_YOU',
        '--debug': 'TAKE_A_BREAK',
        '--ignore': 'GOD_HELP_YOU',
      }
      const reactionType = reactionMap[command]
      if (reactionType) {
        await api.post(`/posts/${post.id}/reactions`, { type: reactionType })
      }
    } catch (error) {
      console.error('Failed to add reaction:', error)
    }
  }

  return (
    <div className="font-mono text-sm border-b border-terminal-gray pb-4 mb-4 last:border-0">
      <div className="flex items-start gap-2 mb-2" dir="ltr">
        <span className="text-terminal-accent">[{dateStr} {timeStr}]</span>
        <span className={levelColors[level as keyof typeof levelColors]}>
          [LEVEL: {level}]
        </span>
        <span className="text-terminal-text">[USER: {username}]</span>
      </div>
      <div className="text-terminal-text mb-3 ml-4" dir="rtl">
        &gt;&gt; "{post.content}"
      </div>
      <div className="flex gap-2 ml-4" dir="ltr">
        <Button
          variant="terminal"
          size="sm"
          onClick={() => handleReaction('--fsh_ghalil')}
          className="text-xs"
        >
          --fsh_ghalil
        </Button>
        <Button
          variant="terminal"
          size="sm"
          onClick={() => handleReaction('--debug')}
          className="text-xs"
        >
          --debug
        </Button>
        <Button
          variant="terminal"
          size="sm"
          onClick={() => handleReaction('--ignore')}
          className="text-xs"
        >
          --ignore
        </Button>
      </div>
    </div>
  )
}

