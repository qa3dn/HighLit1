'use client'

import { useState } from 'react'
import { Settings, Award, GraduationCap, Github, Code2, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUpdateStatus } from '@/hooks/useRoom'
import { rankLabel } from '@/lib/rankMeta'

interface IdentityHeaderProps {
  user: {
    id: string
    username: string
    rank: string
    reputation_points: number
    avatar_url?: string
    banner_url?: string
    status_text?: string
    bio?: string
    university?: string
    major?: string
    github_username?: string
  }
  codeCount?: number
  isOwnProfile: boolean
  onEditClick?: () => void
}

export function IdentityHeader({ user, codeCount = 0, isOwnProfile, onEditClick }: IdentityHeaderProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [statusText, setStatusText] = useState(user.status_text || '')
  const updateStatus = useUpdateStatus()

  const saveStatus = async () => {
    if (!isOwnProfile) return
    await updateStatus.mutateAsync(statusText.trim())
    setIsEditingStatus(false)
  }

  return (
    <div dir="rtl" className="border-b border-gray-dark">
      {/* Banner */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-l from-accent/15 via-gray-light to-bg sm:h-40">
        {user.banner_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.banner_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-bg shadow-glow">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gray-light font-mono text-3xl font-bold text-accent">
                {(user.username || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1 sm:pb-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-2xl font-bold text-text">{user.username}</h1>
              {user.rank && (
                <span
                  className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-xs text-accent"
                  title={user.rank}
                >
                  <Award className="h-3.5 w-3.5" /> {rankLabel(user.rank)}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-text-secondary">
                <span className="font-mono font-bold text-accent">{user.reputation_points}</span> نقطة سمعة
              </span>
              <span className="flex items-center gap-1 text-sm text-text-secondary">
                <Code2 className="h-3.5 w-3.5 text-accent/70" aria-hidden />
                <span className="font-mono text-text">{codeCount}</span> مستودع
              </span>
            </div>

            {/* Status */}
            {isOwnProfile && isEditingStatus ? (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveStatus()
                    if (e.key === 'Escape') {
                      setStatusText(user.status_text || '')
                      setIsEditingStatus(false)
                    }
                  }}
                  placeholder="بماذا تعمل الآن؟"
                  className="flex-1 rounded-lg border border-accent/30 bg-gray-light px-3 py-1.5 font-mono text-sm text-text outline-none focus:border-accent"
                  autoFocus
                />
                <button
                  onClick={saveStatus}
                  disabled={updateStatus.isPending}
                  aria-label="حفظ الحالة"
                  className="rounded-lg border border-accent/40 p-1.5 text-accent hover:bg-accent/10 disabled:opacity-50"
                >
                  {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setStatusText(user.status_text || '')
                    setIsEditingStatus(false)
                  }}
                  aria-label="إلغاء"
                  className="rounded-lg border border-gray-dark p-1.5 text-text-secondary hover:text-text"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : isOwnProfile ? (
              <button
                onClick={() => setIsEditingStatus(true)}
                className="mt-1.5 font-mono text-sm text-text-secondary transition-colors hover:text-accent"
              >
                {user.status_text || 'اضغط لتعيين حالتك...'}
              </button>
            ) : (
              user.status_text && <p className="mt-1.5 font-mono text-sm text-accent">{user.status_text}</p>
            )}

            {/* Meta */}
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-text-secondary">
              {(user.university || user.major) && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-accent/70" aria-hidden />
                  {[user.university, user.major].filter(Boolean).join(' · ')}
                </span>
              )}
              {user.github_username && (
                <a
                  href={`https://github.com/${user.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-accent"
                  dir="ltr"
                >
                  <Github className="h-4 w-4" />@{user.github_username}
                </a>
              )}
            </div>

            {user.bio && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">{user.bio}</p>}
          </div>

          {/* Edit */}
          {isOwnProfile && (
            <Button variant="outline" size="sm" onClick={onEditClick} className="flex flex-shrink-0 items-center gap-2 sm:pb-1">
              <Settings className="h-4 w-4" />
              تعديل الملف
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
