'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Lock, Loader2, FileText, Mail, GraduationCap, Github } from 'lucide-react'
import { useApplicants, useUpdateApplicationStatus } from '@/hooks/useJobs'
import type { Applicant, ApplicationStatus, Job } from '@/lib/api/jobs'

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'PENDING', label: 'قيد المراجعة' },
  { value: 'REVIEWED', label: 'تمت المراجعة' },
  { value: 'SHORTLISTED', label: 'القائمة المختصرة' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'ACCEPTED', label: 'مقبول' },
]

function ApplicantCard({
  app,
  showContact,
  onStatus,
}: {
  app: Applicant
  showContact: boolean
  onStatus: (appId: number, status: ApplicationStatus) => void
}) {
  const u = app.applicant
  return (
    <div className="rounded-xl border border-gray-dark bg-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">@{u.username}</span>
            {u.rank && <span className="text-xs text-text-secondary">{u.rank}</span>}
          </div>
          <p className="text-xs text-text-secondary">
            {formatDistanceToNow(new Date(app.created_at), { addSuffix: true, locale: ar })}
          </p>
        </div>
        <select
          value={app.status}
          onChange={(e) => onStatus(app.id, e.target.value as ApplicationStatus)}
          className="rounded-lg border border-gray-dark bg-gray-light px-2 py-1 text-xs text-text outline-none focus:border-accent"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {app.cover_letter && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{app.cover_letter}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {app.resume_url && (
          <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline" dir="ltr">
            <FileText className="h-3.5 w-3.5" /> السيرة الذاتية
          </a>
        )}
        {showContact && u.email && (
          <span className="flex items-center gap-1 text-text-secondary" dir="ltr">
            <Mail className="h-3.5 w-3.5" /> {u.email}
          </span>
        )}
        {showContact && u.github_username && (
          <span className="flex items-center gap-1 text-text-secondary" dir="ltr">
            <Github className="h-3.5 w-3.5" /> {u.github_username}
          </span>
        )}
        {showContact && (u.university || u.major) && (
          <span className="flex items-center gap-1 text-text-secondary">
            <GraduationCap className="h-3.5 w-3.5" /> {[u.major, u.university].filter(Boolean).join(' - ')}
          </span>
        )}
      </div>
    </div>
  )
}

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
  const { data, isLoading } = useApplicants(jobId)
  const updateStatus = useUpdateApplicationStatus(jobId ?? '')

  if (jobs.length === 0) {
    return <p className="py-12 text-center text-text-secondary">انشر وظيفة أولاً لاستقبال المتقدمين.</p>
  }

  return (
    <div className="space-y-4">
      <select
        value={jobId}
        onChange={(e) => setJobId(Number(e.target.value))}
        className="w-full rounded-lg border border-gray-dark bg-gray-light px-3 py-2 text-sm text-text outline-none focus:border-accent sm:w-auto"
      >
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>
            {j.title} ({j.application_count})
          </option>
        ))}
      </select>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : !data ? (
        <p className="py-12 text-center text-text-secondary">تعذّر تحميل المتقدمين.</p>
      ) : data.total === 0 ? (
        <p className="py-12 text-center text-text-secondary">لا يوجد متقدمون بعد.</p>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>{data.total} متقدم</span>
            {data.plan && <span>الباقة: {data.plan.name}</span>}
          </div>

          <div className="space-y-3">
            {data.results.map((app) => (
              <ApplicantCard
                key={app.id}
                app={app}
                showContact={data.plan ? data.plan.can_view_applicant_contact : true}
                onStatus={(appId, status) => updateStatus.mutate({ appId, status })}
              />
            ))}
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
              <button
                onClick={onUpgrade}
                className="mt-3 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
              >
                ترقية الباقة
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
