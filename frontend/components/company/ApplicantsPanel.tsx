'use client'

import { useMemo, useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Lock,
  Loader2,
  FileText,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  Search,
  Copy,
  Check,
  ChevronRight,
  Briefcase,
  CalendarDays,
  Inbox,
  Sparkles,
} from 'lucide-react'
import { useApplicants, useUpdateApplicationStatus } from '@/hooks/useJobs'
import { normalizeApplicant, type Applicant, type ApplicationStatus, type Job } from '@/lib/api/jobs'

interface StatusMeta {
  value: ApplicationStatus
  label: string
  badge: string
  dot: string
}

const STATUSES: StatusMeta[] = [
  { value: 'PENDING', label: 'قيد المراجعة', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
  { value: 'REVIEWED', label: 'تمت المراجعة', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
  { value: 'SHORTLISTED', label: 'القائمة المختصرة', badge: 'bg-accent/10 text-accent border-accent/30', dot: 'bg-accent' },
  { value: 'ACCEPTED', label: 'مقبول', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  { value: 'REJECTED', label: 'مرفوض', badge: 'bg-red-500/10 text-red-400 border-red-500/30', dot: 'bg-red-400' },
]
const STATUS_MAP: Record<string, StatusMeta> = Object.fromEntries(STATUSES.map((s) => [s.value, s]))

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const s = STATUS_MAP[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function Avatar({ name, url, size = 'md' }: { name: string; url?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-9 w-9 text-sm' : 'h-11 w-11'
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={`${dim} shrink-0 rounded-full border border-gray-dark object-cover`} />
  }
  return (
    <span className={`${dim} flex shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-bold text-accent`}>
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function matchTone(pct: number): string {
  if (pct >= 75) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  if (pct >= 40) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
  return 'bg-gray-dark/40 text-text-secondary border-gray-dark'
}

function MatchBadge({ pct, size = 'sm' }: { pct: number | null; size?: 'sm' | 'lg' }) {
  if (pct === null) return null
  const cls = size === 'lg' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${cls} ${matchTone(pct)}`}>
      <Sparkles className="h-3 w-3" />
      {pct}% مطابقة
    </span>
  )
}

// ── Detail pane ───────────────────────────────────────────────────────────────

function ApplicantDetail({
  app,
  jobTitle,
  showContact,
  onStatus,
  pending,
  onBack,
}: {
  app: Applicant
  jobTitle: string
  showContact: boolean
  onStatus: (status: ApplicationStatus) => void
  pending: boolean
  onBack: () => void
}) {
  const u = app.applicant
  const [copied, setCopied] = useState(false)

  const contactEmail = app.email || u.email || ''
  const displayName = app.full_name || `@${u.username}`

  const copyEmail = async () => {
    if (!contactEmail) return
    try {
      await navigator.clipboard.writeText(contactEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const mailto = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`بخصوص تقديمك على وظيفة: ${jobTitle}`)}`
    : undefined

  return (
    <div className="rounded-2xl border border-gray-dark bg-gray-light">
      {/* Mobile back */}
      <button onClick={onBack} className="flex items-center gap-1 p-3 text-sm text-text-secondary hover:text-accent md:hidden">
        <ChevronRight className="h-4 w-4" /> رجوع للقائمة
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 border-b border-gray-dark p-5">
        <Avatar name={app.full_name || u.username} url={app.photo_url || u.avatar_url} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-text">{displayName}</h3>
            <span className="text-sm text-text-secondary">@{u.username}</span>
            {u.rank && <span className="rounded-full border border-gray-dark px-2 py-0.5 text-[11px] text-text-secondary">{u.rank}</span>}
            <MatchBadge pct={app.skill_match} size="lg" />
          </div>
          {app.headline && <p className="mt-0.5 text-sm text-text">{app.headline}</p>}
          {(app.location || u.major || u.university) && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-text-secondary">
              {app.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {app.location}
                </span>
              )}
              {(u.major || u.university) && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" /> {[u.major, u.university].filter(Boolean).join(' — ')}
                </span>
              )}
            </p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
            <CalendarDays className="h-3.5 w-3.5" />
            تقدّم {formatDistanceToNow(new Date(app.created_at), { addSuffix: true, locale: ar })}
            <span className="text-text-secondary/60">· {format(new Date(app.created_at), 'd MMM yyyy', { locale: ar })}</span>
          </p>
          <div className="mt-2">
            <StatusBadge status={app.status} />
          </div>
        </div>
      </div>

      {/* Communication */}
      <div className="border-b border-gray-dark p-5">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">التواصل</h4>
        {showContact ? (
          <div className="flex flex-wrap gap-2">
            {mailto && (
              <a href={mailto} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg hover:bg-accent-hover">
                <Mail className="h-4 w-4" /> مراسلة عبر البريد
              </a>
            )}
            {contactEmail && (
              <button onClick={copyEmail} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-dark px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent" dir="ltr">
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />} {contactEmail}
              </button>
            )}
            {app.phone && (
              <a href={`tel:${app.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-dark px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent" dir="ltr">
                <Phone className="h-4 w-4" /> {app.phone}
              </a>
            )}
            {u.github_username && (
              <a href={`https://github.com/${u.github_username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-dark px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent" dir="ltr">
                <Github className="h-4 w-4" /> {u.github_username}
              </a>
            )}
            {app.linkedin_url && (
              <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-dark px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {app.portfolio_url && (
              <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-dark px-3 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent">
                <Globe className="h-4 w-4" /> الأعمال
              </a>
            )}
            {app.resume_url && (
              <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/20">
                <FileText className="h-4 w-4" /> عرض السيرة الذاتية
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-text-secondary">
            <Lock className="h-4 w-4 shrink-0 text-accent" />
            بيانات التواصل متاحة في باقة أعلى.
          </div>
        )}
      </div>

      {/* Skills + match against required */}
      {(app.skills.length > 0 || app.matched_skills.length > 0 || app.missing_skills.length > 0) && (
        <div className="border-b border-gray-dark p-5">
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            المهارات
            <MatchBadge pct={app.skill_match} />
          </h4>
          <div className="flex flex-wrap gap-2">
            {app.matched_skills.map((s) => (
              <span key={`m-${s}`} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                <Check className="h-3 w-3" /> {s}
              </span>
            ))}
            {app.skills
              .filter((s) => !app.matched_skills.some((m) => m.toLowerCase() === s.toLowerCase()))
              .map((s) => (
                <span key={`s-${s}`} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                  {s}
                </span>
              ))}
            {app.missing_skills.map((s) => (
              <span key={`x-${s}`} className="rounded-full border border-gray-dark px-2.5 py-0.5 text-xs text-text-secondary line-through opacity-60">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {app.experience.length > 0 && (
        <div className="border-b border-gray-dark p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <Briefcase className="h-3.5 w-3.5" /> الخبرات السابقة
          </h4>
          <ol className="space-y-3 border-r border-gray-dark pr-4">
            {app.experience.map((x, i) => (
              <li key={i} className="relative">
                <span className="absolute -right-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                <p className="text-sm font-semibold text-text">
                  {x.title || 'دور'}
                  {x.company && <span className="font-normal text-text-secondary"> · {x.company}</span>}
                </p>
                {(x.start || x.end) && (
                  <p className="text-[11px] text-text-secondary" dir="ltr">
                    {[x.start, x.end].filter(Boolean).join(' — ')}
                  </p>
                )}
                {x.description && <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-text-secondary">{x.description}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Education */}
      {app.education.length > 0 && (
        <div className="border-b border-gray-dark p-5">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <GraduationCap className="h-3.5 w-3.5" /> التعليم
          </h4>
          <ol className="space-y-3 border-r border-gray-dark pr-4">
            {app.education.map((e, i) => (
              <li key={i} className="relative">
                <span className="absolute -right-[21px] top-1.5 h-2 w-2 rounded-full bg-accent" />
                <p className="text-sm font-semibold text-text">
                  {[e.degree, e.field].filter(Boolean).join(' — ') || 'مؤهل'}
                </p>
                {e.institution && <p className="text-xs text-text-secondary">{e.institution}</p>}
                {(e.start_year || e.end_year) && (
                  <p className="text-[11px] text-text-secondary" dir="ltr">
                    {[e.start_year, e.end_year].filter(Boolean).join(' — ')}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Cover letter */}
      <div className="border-b border-gray-dark p-5">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">خطاب التقديم</h4>
        {app.cover_letter ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{app.cover_letter}</p>
        ) : (
          <p className="text-sm text-text-secondary">لم يرفق المتقدّم خطاباً.</p>
        )}
      </div>

      {/* Pipeline */}
      <div className="p-5">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">تحديث الحالة</h4>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const active = app.status === s.value
            return (
              <button
                key={s.value}
                onClick={() => !active && onStatus(s.value)}
                disabled={pending}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                  active ? s.badge : 'border-gray-dark text-text-secondary hover:border-accent hover:text-accent'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </button>
            )
          })}
          {pending && <Loader2 className="h-4 w-4 animate-spin self-center text-accent" />}
        </div>
      </div>
    </div>
  )
}

// ── Panel ──────────────────────────────────────────────────────────────────────

export function ApplicantsPanel({
  jobs,
  initialJobId,
  onUpgrade,
}: {
  jobs: Job[]
  initialJobId?: number
  onUpgrade: () => void
}) {
  const [jobId, setJobId] = useState<number | undefined>(initialJobId ?? jobs[0]?.id)
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'recent' | 'match'>('recent')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data, isLoading } = useApplicants(jobId)
  const updateStatus = useUpdateApplicationStatus(jobId ?? '')
  const jobTitle = jobs.find((j) => j.id === jobId)?.title ?? ''
  const showContact = data?.plan ? data.plan.can_view_applicant_contact : true

  // Re-normalize at consumption: a response cached before the applicant fields
  // shipped (or served by a not-yet-reloaded API) must not crash the render.
  const results = useMemo(() => (data?.results ?? []).map(normalizeApplicant), [data])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const a of results) c[a.status] = (c[a.status] ?? 0) + 1
    return c
  }, [results])

  const filtered = useMemo(() => {
    let list = [...results]
    if (statusFilter !== 'ALL') list = list.filter((a) => a.status === statusFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((a) => {
        const u = a.applicant
        return (
          u.username.toLowerCase().includes(q) ||
          a.full_name.toLowerCase().includes(q) ||
          a.headline.toLowerCase().includes(q) ||
          a.skills.some((s) => s.toLowerCase().includes(q)) ||
          (u.major ?? '').toLowerCase().includes(q) ||
          (u.university ?? '').toLowerCase().includes(q)
        )
      })
    }
    if (sort === 'match') {
      list.sort((a, b) => (b.skill_match ?? -1) - (a.skill_match ?? -1))
    }
    return list
  }, [results, statusFilter, search, sort])

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null

  if (jobs.length === 0) {
    return <p className="py-12 text-center text-text-secondary">انشر وظيفة أولاً لاستقبال المتقدمين.</p>
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: job + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-text-secondary" />
          <select
            value={jobId}
            onChange={(e) => {
              setJobId(Number(e.target.value))
              setSelectedId(null)
              setStatusFilter('ALL')
            }}
            className="rounded-lg border border-gray-dark bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.application_count})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو المهارة أو التخصص..."
              className="w-full rounded-lg border border-gray-dark bg-gray-light py-2 pr-9 pl-3 text-sm text-text outline-none focus:border-accent sm:w-64"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'recent' | 'match')}
            className="rounded-lg border border-gray-dark bg-gray-light px-2 py-2 text-sm text-text outline-none focus:border-accent"
          >
            <option value="recent">الأحدث</option>
            <option value="match">الأفضل مطابقة</option>
          </select>
        </div>
      </div>

      {/* Status filter chips */}
      {data && data.total > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} label="الكل" count={results.length} />
          {STATUSES.map((s) => (
            <FilterChip key={s.value} active={statusFilter === s.value} onClick={() => setStatusFilter(s.value)} label={s.label} count={counts[s.value] ?? 0} dot={s.dot} />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : !data ? (
        <p className="py-12 text-center text-text-secondary">تعذّر تحميل المتقدمين.</p>
      ) : data.total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-text-secondary">
          <Inbox className="h-10 w-10 opacity-40" />
          <p>لا يوجد متقدمون بعد لهذه الوظيفة.</p>
        </div>
      ) : (
        <>
          <div className="md:grid md:grid-cols-[320px_1fr] md:gap-4">
            {/* List */}
            <div className={`space-y-2 ${selected ? 'hidden md:block' : 'block'}`}>
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-text-secondary">لا نتائج مطابقة.</p>
              ) : (
                filtered.map((a) => {
                  const u = a.applicant
                  const isSel = selected?.id === a.id
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition-colors ${
                        isSel ? 'border-accent bg-accent/5' : 'border-gray-dark bg-bg hover:border-accent/40'
                      }`}
                    >
                      <Avatar name={a.full_name || u.username} url={a.photo_url || u.avatar_url} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text">{a.full_name || `@${u.username}`}</p>
                        <p className="truncate text-[11px] text-text-secondary">
                          {a.headline ||
                            [u.major, u.university].filter(Boolean).join(' — ') ||
                            formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <StatusBadge status={a.status} />
                        <MatchBadge pct={a.skill_match} />
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Detail */}
            <div className={`${selected ? 'block' : 'hidden md:block'}`}>
              {selected ? (
                <ApplicantDetail
                  app={selected}
                  jobTitle={jobTitle}
                  showContact={showContact}
                  pending={updateStatus.isPending}
                  onBack={() => setSelectedId(null)}
                  onStatus={(status) => updateStatus.mutate({ appId: selected.id, status })}
                />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-dark text-sm text-text-secondary">
                  اختر متقدّماً لعرض التفاصيل
                </div>
              )}
            </div>
          </div>

          {data.locked_count > 0 && (
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-5 text-center">
              <Lock className="mx-auto h-6 w-6 text-accent" />
              <p className="mt-2 text-sm text-text">
                هناك <span className="font-bold text-accent">{data.locked_count}</span> متقدّمين إضافيين مخفيين في باقتك الحالية.
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                باقتك تعرض حتى {data.limit} متقدم لكل وظيفة. رقِّ باقتك لعرض جميع المتقدمين.
              </p>
              <button onClick={onUpgrade} className="mt-3 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent-hover">
                ترقية الباقة
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dot,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  dot?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'border-accent bg-accent/10 text-accent' : 'border-gray-dark text-text-secondary hover:text-text'
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {label}
      <span className="rounded-full bg-gray-dark px-1.5 text-[10px] text-text-secondary">{count}</span>
    </button>
  )
}
