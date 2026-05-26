'use client'

import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Briefcase, Users, Star, CreditCard, Plus, BarChart3 } from 'lucide-react'
import { useSubscription } from '@/hooks/useCompanies'
import type { Company } from '@/lib/api/companies'
import type { Job } from '@/lib/api/jobs'
import { JOB_TYPE_LABEL } from '@/lib/jobMeta'

type Section = 'overview' | 'careers' | 'applicants' | 'subscription' | 'settings'

const STATUS_LABEL: Record<string, string> = { DRAFT: 'مسودة', PUBLISHED: 'منشورة', CLOSED: 'مغلقة' }

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Briefcase
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-dark bg-gray-light p-4">
      <div className="flex items-center gap-2 text-text-secondary">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-text">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-text-secondary">{hint}</div>}
    </div>
  )
}

export function CompanyOverview({
  company,
  jobs,
  onNavigate,
}: {
  company: Company
  jobs: Job[]
  onNavigate: (section: Section) => void
}) {
  const { data: sub } = useSubscription(company.slug)

  const activeJobs = jobs.filter((j) => j.status === 'PUBLISHED').length
  const totalApplicants = jobs.reduce((sum, j) => sum + j.application_count, 0)
  const featuredJobs = jobs.filter((j) => j.is_featured).length
  const recentJobs = [...jobs]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5)

  const maxJobs = sub?.limits.max_active_jobs ?? 1
  const planName = sub?.limits.name ?? '—'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text">مرحباً، {company.name}</h2>
        <p className="text-sm text-text-secondary">نظرة عامة على نشاط التوظيف لديك.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="الوظائف النشطة" value={activeJobs} hint={`${jobs.length} إجمالي`} />
        <StatCard icon={Users} label="إجمالي المتقدمين" value={totalApplicants} />
        <StatCard icon={Star} label="إعلانات مميّزة" value={featuredJobs} />
        <StatCard icon={CreditCard} label="الباقة الحالية" value={planName} />
      </div>

      {/* Plan usage */}
      {sub && (
        <div className="rounded-2xl border border-gray-dark bg-gray-light p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
              <BarChart3 className="h-4 w-4 text-accent" /> استهلاك الباقة
            </h3>
            <button onClick={() => onNavigate('subscription')} className="text-xs text-accent hover:underline">
              إدارة الاشتراك
            </button>
          </div>
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>الوظائف النشطة</span>
            <span>
              {sub.usage.active_jobs} / {maxJobs >= 100000 ? '∞' : maxJobs}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${maxJobs >= 100000 ? 8 : Math.min(100, (sub.usage.active_jobs / Math.max(maxJobs, 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onNavigate('careers')}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> نشر وظيفة
        </button>
        <button
          onClick={() => onNavigate('applicants')}
          className="flex items-center gap-1.5 rounded-lg border border-gray-dark px-4 py-2 text-sm text-text hover:border-accent hover:text-accent"
        >
          <Users className="h-4 w-4" /> إدارة المتقدمين
        </button>
        <button
          onClick={() => onNavigate('subscription')}
          className="flex items-center gap-1.5 rounded-lg border border-gray-dark px-4 py-2 text-sm text-text hover:border-accent hover:text-accent"
        >
          <CreditCard className="h-4 w-4" /> ترقية الباقة
        </button>
      </div>

      {/* Recent jobs */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-text">أحدث الوظائف</h3>
          <button onClick={() => onNavigate('careers')} className="text-xs text-accent hover:underline">
            عرض الكل
          </button>
        </div>
        {recentJobs.length === 0 ? (
          <p className="rounded-xl border border-gray-dark bg-gray-light py-10 text-center text-sm text-text-secondary">
            لم تنشر أي وظيفة بعد.
          </p>
        ) : (
          <div className="space-y-2">
            {recentJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onNavigate('careers')}
                className="flex w-full items-center justify-between rounded-xl border border-gray-dark bg-gray-light p-3 text-right transition-colors hover:border-accent"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-text">{job.title}</span>
                    {job.is_featured && <Star className="h-3.5 w-3.5 flex-shrink-0 text-accent" />}
                  </div>
                  <span className="text-xs text-text-secondary">
                    {STATUS_LABEL[job.status] ?? job.status} · {JOB_TYPE_LABEL[job.job_type]} ·{' '}
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ar })}
                  </span>
                </div>
                <span className="flex flex-shrink-0 items-center gap-1 text-xs text-text-secondary">
                  <Users className="h-3.5 w-3.5" /> {job.application_count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
