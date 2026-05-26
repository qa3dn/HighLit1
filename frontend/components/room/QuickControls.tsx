'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Github, ExternalLink, Download, LogOut, Check, Loader2, X, Pencil } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/hooks/useProfile'
import { playClickSound } from '@/lib/audio'

// Mirrors the backend SSRF-safe handle rule (apps/accounts/github.py).
const GITHUB_HANDLE = /^[A-Za-z0-9-]{1,39}$/

interface QuickControlsProps {
  isOwnProfile: boolean
}

export function QuickControls({ isOwnProfile }: QuickControlsProps) {
  const router = useRouter()
  const { data: user } = useCurrentUser()
  const update = useUpdateProfile(user?.id ?? '')
  const [editing, setEditing] = useState(false)
  const [handle, setHandle] = useState('')

  if (!isOwnProfile || !user) {
    return null
  }

  const linkedHandle = user.github_username?.trim() ?? ''
  const isLinked = linkedHandle.length > 0 && !editing
  const cleaned = handle.trim().replace(/^@/, '')
  const valid = GITHUB_HANDLE.test(cleaned)

  const saveHandle = () => {
    if (!valid) {
      return
    }
    playClickSound()
    update.mutate(
      { github_username: cleaned },
      { onSuccess: () => { setEditing(false); setHandle('') } },
    )
  }

  const unlink = () => {
    playClickSound()
    update.mutate(
      { github_username: '' },
      { onSuccess: () => { setEditing(false); setHandle('') } },
    )
  }

  const startEdit = () => {
    playClickSound()
    setHandle(linkedHandle)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setHandle('')
  }

  const exportData = () => {
    playClickSound()
    const payload = {
      username: user.username,
      email: user.email,
      rank: user.rank,
      reputation_points: user.reputation_points,
      bio: user.bio ?? '',
      status_text: user.status_text ?? '',
      university: user.university ?? '',
      major: user.major ?? '',
      github_username: user.github_username ?? '',
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `highlit-${user.username}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const signOut = () => {
    playClickSound()
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    router.push('/')
    window.location.reload()
  }

  return (
    <aside className="flex h-full w-64 flex-col border-l border-gray-dark bg-bg" dir="rtl">
      <div className="border-b border-gray-dark px-4 py-3.5">
        <h2 className="font-mono text-sm font-bold text-accent">تحكم سريع</h2>
        <p className="mt-0.5 text-[11px] text-text-secondary">إدارة حسابك وبياناتك</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* GitHub */}
        <section className="rounded-xl border border-gray-dark bg-gray-light p-3.5">
          <div className="mb-2.5 flex items-center gap-2">
            <Github className="h-4 w-4 text-accent" />
            <h3 className="text-xs font-semibold text-text">ربط GitHub</h3>
          </div>

          {isLinked ? (
            <div className="space-y-2.5">
              <a
                href={`https://github.com/${linkedHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-dark bg-bg px-2.5 py-2 font-mono text-xs text-accent hover:border-accent"
                dir="ltr"
              >
                <span className="truncate">@{linkedHandle}</span>
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </a>
              <div className="flex gap-2">
                <button
                  onClick={startEdit}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-dark px-2 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                >
                  <Pencil className="h-3 w-3" /> تغيير
                </button>
                <button
                  onClick={unlink}
                  disabled={update.isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-dark px-2 py-1.5 text-xs text-red-400 transition-colors hover:border-red-400/60 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <X className="h-3 w-3" /> فصل
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && valid) { saveHandle() } }}
                placeholder="octocat"
                dir="ltr"
                className="w-full rounded-lg border border-gray-dark bg-bg px-2.5 py-2 font-mono text-xs text-text outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveHandle}
                  disabled={!valid || update.isPending}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-2 py-1.5 text-xs font-semibold text-bg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {update.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  ربط
                </button>
                {editing && (
                  <button
                    onClick={cancelEdit}
                    className="rounded-lg border border-gray-dark px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent"
                  >
                    إلغاء
                  </button>
                )}
              </div>
              {handle.trim().length > 0 && !valid && (
                <p className="text-[11px] text-red-400">اسم مستخدم GitHub غير صالح.</p>
              )}
              <p className="text-[11px] leading-relaxed text-text-secondary">
                نعرض مستودعاتك العامة فقط — بدون صلاحيات أو رموز وصول.
              </p>
            </div>
          )}
          {update.isError && <p className="mt-2 text-[11px] text-red-400">تعذّر الحفظ، حاول مجددًا.</p>}
        </section>

        {/* Data */}
        <section className="rounded-xl border border-gray-dark bg-gray-light p-3.5">
          <h3 className="mb-2.5 text-xs font-semibold text-text">البيانات</h3>
          <button
            onClick={exportData}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-dark bg-bg px-2.5 py-2 text-xs text-text transition-colors hover:border-accent hover:text-accent"
          >
            <Download className="h-3.5 w-3.5" /> تصدير بياناتي (JSON)
          </button>
        </section>

        {/* Session */}
        <section className="rounded-xl border border-gray-dark bg-gray-light p-3.5">
          <h3 className="mb-2.5 text-xs font-semibold text-text">الجلسة</h3>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-dark bg-bg px-2.5 py-2 text-xs text-red-400 transition-colors hover:border-red-400/60 hover:bg-red-500/10"
          >
            <LogOut className="h-3.5 w-3.5" /> تسجيل الخروج
          </button>
        </section>
      </div>
    </aside>
  )
}
