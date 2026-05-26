'use client'

import { ExternalLink, Github } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

interface GitHubBlockProps {
  githubUrl: string
  demoUrl?: string
}

export function GitHubBlock({ githubUrl, demoUrl }: GitHubBlockProps) {
  if (!githubUrl) return null

  let repoLabel = githubUrl
  try {
    const parsed = new URL(githubUrl)
    repoLabel = parsed.pathname.replace(/^\//, '')
  } catch {
    /* keep full url */
  }

  return (
    <div
      className="rounded-2xl border border-gray-dark bg-gradient-to-br from-gray-light to-bg p-6 sm:p-8"
      dir="rtl"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
          <Github className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text">مستودع GitHub</h3>
          <p className="font-mono text-sm text-text-secondary" dir="ltr">
            {repoLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClickSound}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition hover:bg-accent-hover"
        >
          <Github className="h-4 w-4" />
          عرض المستودع
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </a>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClickSound}
            className="inline-flex items-center gap-2 rounded-xl border border-accent px-5 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/10"
          >
            تجربة مباشرة
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
