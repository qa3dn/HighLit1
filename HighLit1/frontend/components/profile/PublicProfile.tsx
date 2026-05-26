'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Lock,
  Github,
  GraduationCap,
  Award,
  MessageSquare,
  Code2,
  Lightbulb,
  Heart,
  FolderGit2,
  FileCode2,
} from 'lucide-react'
import { usePublicProfile } from '@/hooks/useProfile'
import { useCurrentUser } from '@/hooks/useAuth'
import { RantCard } from '@/components/rants/RantCard'
import { GithubRepos } from './GithubRepos'

type Tab = 'posts' | 'repos' | 'ideas'

interface PublicProfileProps {
  userId: number | string
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-dark bg-gray-light p-4 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div className="text-xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-secondary">{label}</div>
    </div>
  )
}

export function PublicProfile({ userId }: PublicProfileProps) {
  const { data, isLoading, isError } = usePublicProfile(userId)
  const { data: currentUser } = useCurrentUser()
  const isAuthenticated = !!currentUser
  const [tab, setTab] = useState<Tab>('posts')

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-10" dir="rtl">
        <div className="h-40 rounded-2xl bg-gray-light" />
        <div className="mt-4 h-6 w-48 rounded bg-gray-light" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-light" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-text-secondary" dir="rtl">
        تعذّر تحميل الملف الشخصي.
      </div>
    )
  }

  // Private profile (viewer is not the owner) → minimal locked view.
  if (data.is_private) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center" dir="rtl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-dark bg-gray-light text-2xl">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt={data.username} className="h-full w-full rounded-full object-cover" />
          ) : (
            (data.username || '?').charAt(0).toUpperCase()
          )}
        </div>
        <h1 className="mb-2 text-xl font-bold text-text">{data.username}</h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-dark px-4 py-2 text-sm text-text-secondary">
          <Lock className="h-4 w-4" /> هذا الملف الشخصي خاص
        </div>
      </div>
    )
  }

  const profile = data.profile!
  const activity = data.activity
  const posts = data.posts ?? []
  const code = data.code ?? []
  const projects = data.projects ?? []
  const ideas = data.ideas ?? []
  const repos = data.github_repos ?? []

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'posts', label: 'الفضفضات', count: posts.length },
    { id: 'repos', label: 'المستودعات', count: repos.length + code.length + projects.length },
    { id: 'ideas', label: 'الأفكار', count: ideas.length },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-6" dir="rtl">
      {/* Banner + avatar */}
      <div className="relative mb-16 overflow-hidden rounded-2xl border border-gray-dark">
        <div className="h-40 w-full bg-gradient-to-l from-accent/20 via-gray-light to-bg sm:h-48">
          {profile.banner_url && (
            <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="absolute -bottom-12 right-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-bg bg-gray-light text-3xl text-accent shadow-large">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" />
          ) : (
            <span className="font-mono">{profile.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-text">{profile.username}</h1>
          <span className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 font-mono text-xs text-accent">
            <Award className="h-3.5 w-3.5" />
            {profile.rank}
          </span>
          <span className="text-sm text-text-secondary">{profile.reputation_points} نقطة</span>
        </div>
        {profile.status_text && <p className="mt-1 font-mono text-sm text-accent">{profile.status_text}</p>}
        {profile.bio && <p className="mt-3 max-w-2xl leading-relaxed text-text-secondary">{profile.bio}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          {(profile.university || profile.major) && (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              {[profile.university, profile.major].filter(Boolean).join(' · ')}
            </span>
          )}
          {profile.github_username && (
            <a
              href={`https://github.com/${profile.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-accent"
              dir="ltr"
            >
              <Github className="h-4 w-4" />@{profile.github_username}
            </a>
          )}
          <span>
            عضو {formatDistanceToNow(new Date(profile.member_since), { addSuffix: true, locale: ar })}
          </span>
        </div>
      </div>

      {/* Activity overview */}
      {activity && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<MessageSquare className="h-4 w-4" />} label="فضفضات" value={activity.posts} />
          <StatCard icon={<Code2 className="h-4 w-4" />} label="مستودعات" value={activity.code} />
          <StatCard icon={<Lightbulb className="h-4 w-4" />} label="أفكار" value={activity.ideas} />
          <StatCard icon={<Heart className="h-4 w-4" />} label="تفاعلات" value={activity.reactions_received} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-gray-dark">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm transition-colors ${
              tab === t.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {t.label}
            <span className="rounded-full bg-gray-light px-1.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'posts' &&
        (posts.length === 0 ? (
          <Empty text="لا توجد فضفضات عامة." />
        ) : (
          <div>
            {posts.map((post) => (
              <RantCard key={post.id} post={post} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        ))}

      {tab === 'repos' && (
        <div className="space-y-6">
          {profile.github_username || repos.length > 0 ? (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <Github className="h-4 w-4" /> مستودعات GitHub
              </h3>
              <GithubRepos repos={repos} username={profile.github_username} />
            </div>
          ) : null}

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary">
              <FolderGit2 className="h-4 w-4" /> مشاريع الكود
            </h3>
            {projects.length === 0 ? (
              <Empty text="لا توجد مشاريع عامة." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/code-projects/${project.slug}`}
                    className="group rounded-xl border border-gray-dark bg-gray-light p-4 transition-colors hover:border-accent/50"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-accent" />
                      <span className="font-mono text-sm font-semibold text-text group-hover:text-accent">
                        {project.name}
                      </span>
                    </div>
                    {project.description && (
                      <p className="mb-2 line-clamp-2 text-xs text-text-secondary">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      {project.language && <span className="text-accent">{project.language}</span>}
                      <span className="flex items-center gap-1">
                        <FileCode2 className="h-3.5 w-3.5" /> {project.file_count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {code.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <Code2 className="h-4 w-4" /> مقتطفات كود
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {code.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-dark bg-gray-light p-4">
                    <div className="mb-1 font-mono text-sm font-semibold text-accent">{item.title}</div>
                    <div className="mb-2 text-xs text-text-secondary">{item.language}</div>
                    {item.description && (
                      <p className="line-clamp-2 text-xs text-text-secondary">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'ideas' &&
        (ideas.length === 0 ? (
          <Empty text="لا توجد أفكار منشورة." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ideas.map((idea) => (
              <div key={idea.id} className="rounded-xl border border-gray-dark bg-gray-light p-4">
                <div className="mb-1 font-semibold text-text">{idea.title}</div>
                {idea.description && (
                  <p className="line-clamp-3 text-sm text-text-secondary">{idea.description}</p>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-gray-dark bg-gray-light py-12 text-center text-sm text-text-secondary">
      {text}
    </div>
  )
}
