'use client'

import { useState } from 'react'
import { Github, ExternalLink, Loader2 } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

interface GistLinkerProps {
  onGistLinked: (gistData: { url: string; content: string }) => void
}

export function GistLinker({ onGistLinked }: GistLinkerProps) {
  const [gistUrl, setGistUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractGistId = (url: string): string | null => {
    // Support formats:
    // https://gist.github.com/username/gist_id
    // https://gist.github.com/gist_id
    const match = url.match(/gist\.github\.com\/[\w-]+\/([\w]+)/)
    return match ? match[1] : null
  }

  const fetchGist = async () => {
    if (!gistUrl.trim()) return

    playClickSound()
    setIsLoading(true)
    setError(null)

    try {
      const gistId = extractGistId(gistUrl)
      if (!gistId) {
        throw new Error('رابط Gist غير صحيح')
      }

      // Fetch from GitHub Gist API
      const response = await fetch(`https://api.github.com/gists/${gistId}`)
      if (!response.ok) {
        throw new Error('فشل في جلب Gist')
      }

      const data = await response.json()
      const files = Object.values(data.files) as any[]
      const content = files.map((file) => file.content).join('\n\n')

      onGistLinked({
        url: gistUrl,
        content: `\`\`\`${files[0]?.language || 'text'}\n${content}\n\`\`\``,
      })

      setGistUrl('')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2" dir="rtl">
      <div className="flex items-center gap-2 mb-2">
        <Github className="w-4 h-4 text-accent" />
        <span className="text-sm font-mono text-text">ربط GitHub Gist</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={gistUrl}
          onChange={(e) => setGistUrl(e.target.value)}
          placeholder="https://gist.github.com/username/gist_id"
          className="flex-1 bg-gray-light border border-gray-dark rounded-lg px-4 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
          dir="ltr"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchGist()
            }
          }}
        />
        <button
          onClick={fetchGist}
          disabled={isLoading || !gistUrl.trim()}
          className="px-4 py-2 bg-accent text-bg rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 font-mono">{error}</p>
      )}
    </div>
  )
}

