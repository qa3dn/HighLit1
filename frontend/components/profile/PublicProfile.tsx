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
  CalendarDays,
} from 'lucide-react'
import { usePublicProfile } from '@/hooks/useProfile'
import { useCurrentUser } from '@/hooks/useAuth'
import { RantCard } from '@/components/rants/RantCard'
import { rankLabel } from '@/lib/rankMeta'
import { GithubRepos } from './GithubRepos'

type Tab = 'posts' | 'works' | 'ideas'

interface PublicProfileProps {
  userId: number | string
}

function ProfileAvatar({ url, name, className }: { url?: string; name: string; className: string }) {
  const [failed, setFailed] = useState(false)
  if (url && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} onError={() => setFailed(true)} className={`${className} object-cover`} />
  }
  return (
    <span className={`${className} flex items-center justify-center bg-gray-light font-mono font-bold text-accent`}>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  )
}

function StatCard({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: number
  onClick?: () => void
}) {
  const inner = (
    <>
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <div className="font-mono text-xl font-bold text-text">{value}</div>
      <div className="text-xs text-text-secondary">{label}</div>
    </>
  )
  const base = 'rounded-xl border border-gray-dark bg-gray-light p-4 text-center transition-colors'
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} hover:border-accent/50`}>
        {inner}
      </button>
    )
  }
  return <div className={base}>{inner}</div>
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-dark bg-gray-light py-12 text-center text-sm text-text-secondary">
      <span className="text-text-secondary/50">{icon}</span>
      {text}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-6" dir="rtl">
      <div className="h-40 rounded-2xl bg-gray-light sm:h-48" />
      <div className="-mt-12 flex items-end gap-4 px-2 sm:px-6">
        <div className="h-24 w-24 rounded-2xl border-4 border-bg bg-gray" />
        <div className="mb-2 flex-1 space-y-2">
          <div className="h-6 w-40 rounded bg-gray" />
          <div className="h-4 w-64 rounded bg-gray" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-light" />
        ))}
      </div>
    </div>
  )
}

export function PublicProfile({ userId }: PublicProfileProps) {
  const { data, isLoading, isError } = usePublicProfile(userId)
  const { data: currentUser } = useCurrentUser()
  const isAuthenticated = !!currentUser
  const [tab, setTab] = useState<Tab>('posts')

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-text-secondary" dir="rtl">
        تعذّر تحميل الملف الشخصي.
      </div>
    )
  }

  // Private profile (viewer is not the owner) → minimal locked view.
  if (data.is_private) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center" dir="rtl">
        <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border border-gray-dark text-2xl">
          <ProfileAvatar url={data.avatar_url} name={data.username ?? '?'} className="h-full w-full rounded-full" />
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
  const worksCount = repos.length + projects.length + code.length

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'posts', label: 'الفضفضات', count: posts.length },
    { id: 'works', label: 'الأعمال', count: worksCount },
    { id: 'ideas', label: 'الأفكار', count: ideas.length },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-6" dir="rtl">
      {/* Hero: banner + overlapping avatar */}
      <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-gray-dark bg-gradient-to-l from-accent/15 via-gray-light to-bg sm:h-48">
        {profile.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.banner_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/10 to-transparent" />
      </div>

      <div className="relative z-10 -mt-12 mb-6 flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:px-6">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-bg shadow-glow">
          <ProfileAvatar url={profile.avatar_url} name={profile.username} className="h-full w-full text-3xl" />
        </div>

        <div className="min-w-0 flex-1 sm:pb-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold text-text">{profile.username}</h1>
            {profile.rank && (
              <span
                className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-xs text-accent"
                title={profile.rank}
              >
                <Award className="h-3.5 w-3.5" /> {rankLabel(profile.rank)}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-text-secondary">
              <span className="font-mono font-bold text-accent">{profile.reputation_points}</span> نقطة سمعة
            </span>
          </div>
          {profile.status_text && <p className="mt-1 font-mono text-sm text-accent">{profile.status_text}</p>}
        </div>
      </div>

      {/* Identity meta */}
      {profile.bio && <p className="mb-3 max-w-2xl leading-relaxed text-text-secondary">{profile.bio}</p>}
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
        {(profile.university || profile.major) && (
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-accent/70" aria-hidden />
            {[profile.university, profile.major].filter(Boolean).join(' · ')}
          </span>
        )}
        {profile.github_username && (
          <a
            href={`https://github.com/${profile.github_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
            dir="ltr"
          >
            <Github className="h-4 w-4" />@{profile.github_username}
          </a>
        )}
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-accent/70" aria-hidden />
          عضو {formatDistanceToNow(new Date(profile.member_since), { addSuffix: true, locale: ar })}
        </span>
      </div>

      {/* Activity overview */}
      {activity && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={<MessageSquare className="h-4 w-4" />} label="فضفضات" value={activity.posts} onClick={() => setTab('posts')} />
          <StatCard icon={<Code2 className="h-4 w-4" />} label="أعمال" value={worksCount} onClick={() => setTab('works')} />
          <StatCard icon={<Lightbulb className="h-4 w-4" />} label="أفكار" value={activity.ideas} onClick={() => setTab('ideas')} />
          <StatCard icon={<Heart className="h-4 w-4" />} label="تفاعلات" value={activity.reactions_received} />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-gray-dark">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm transition-colors ${
              tab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {t.label}
            <span className="rounded-full bg-gray-light px-1.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Posts */}
      {tab === 'posts' &&
        (posts.length === 0 ? (
          <Empty icon={<MessageSquare className="h-8 w-8" />} text="لا توجد فضفضات عامة." />
        ) : (
          <div>
            {posts.map((post) => (
              <RantCard key={post.id} post={post} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        ))}

      {/* Works: GitHub repos + code projects + snippets */}
      {tab === 'works' &&
        (worksCount === 0 && !profile.github_username ? (
          <Empty icon={<FolderGit2 className="h-8 w-8" />} text="لا توجد أعمال منشورة." />
        ) : (
          <div className="space-y-6">
            {(profile.github_username || repos.length > 0) && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                  <Github className="h-4 w-4" /> مستودعات GitHub
                </h3>
                <GithubRepos repos={repos} username={profile.github_username} />
              </div>
            )}

            {projects.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                  <FolderGit2 className="h-4 w-4" /> مشاريع الكود
                </h3>
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
              </div>
            )}

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
        ))}

      {/* Ideas */}
      {tab === 'ideas' &&
        (ideas.length === 0 ? (
          <Empty icon={<Lightbulb className="h-8 w-8" />} text="لا توجد أفكار منشورة." />
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
