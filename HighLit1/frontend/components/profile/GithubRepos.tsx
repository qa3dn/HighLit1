'use client'

import { Github, Star, GitFork } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { GithubRepo } from '@/lib/api/profile'

interface GithubReposProps {
  repos: GithubRepo[]
  username?: string
}

export function GithubRepos({ repos, username }: GithubReposProps) {
  if (repos.length === 0) {
    return (
      <div className="rounded-xl border border-gray-dark bg-gray-light p-6 text-center text-sm text-text-secondary" dir="rtl">
        لا توجد مستودعات GitHub عامة
        {username ? ` لـ @${username}` : ''}.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" dir="rtl">
      {repos.map((repo) => (
        <a
          key={repo.url}
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-xl border border-gray-dark bg-gray-light p-4 transition-colors hover:border-accent/50"
        >
          <div className="mb-2 flex items-center gap-2">
            <Github className="h-4 w-4 text-text-secondary" />
            <span className="truncate font-mono text-sm font-semibold text-text group-hover:text-accent" dir="ltr">
              {repo.name}
            </span>
          </div>
          {repo.description && (
            <p className="mb-3 line-clamp-2 flex-1 text-xs text-text-secondary">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" /> {repo.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" /> {repo.forks}
            </span>
            {repo.updated_at && (
              <span className="mr-auto">
                {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true, locale: ar })}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  )
}
