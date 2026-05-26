'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Plus, Pencil, Trash2, Users, Star } from 'lucide-react'
import { useMyJobs, useDeleteJob } from '@/hooks/useJobs'
import { JobFormModal } from './JobFormModal'
import type { Company } from '@/lib/api/companies'
import type { Job } from '@/lib/api/jobs'
import { JOB_TYPE_LABEL, formatSalary } from '@/lib/jobMeta'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'مسودة',
  PUBLISHED: 'منشورة',
  CLOSED: 'مغلقة',
}

export function CompanyJobsTab({
  company,
  onManageApplicants,
}: {
  company: Company
  onManageApplicants: (job: Job) => void
}) {
  const { data: jobs, isLoading } = useMyJobs()
  const del = useDeleteJob()
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState<Job | null>(null)

  const myJobs = (jobs ?? []).filter((j) => j.company_profile === company.id)

  const remove = (job: Job) => {
    if (window.confirm(`حذف الوظيفة «${job.title}» نهائياً؟`)) {
      del.mutate(job.id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text">وظائف {company.name}</h3>
        <button
          onClick={() => {
            setEditJob(null)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> نشر وظيفة
        </button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-text-secondary">جارٍ التحميل...</p>
      ) : myJobs.length === 0 ? (
        <p className="py-12 text-center text-text-secondary">لا توجد وظائف بعد. انشر أول وظيفة لشركتك.</p>
      ) : (
        <div className="space-y-3">
          {myJobs.map((job) => {
            const salary = formatSalary(job.min_salary, job.max_salary, job.currency)
            return (
              <div key={job.id} className="rounded-xl border border-gray-dark bg-gray-light p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text">{job.title}</h4>
                      {job.is_featured && <Star className="h-3.5 w-3.5 text-accent" />}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                      <span
                        className={`rounded-full px-2 py-0.5 ${
                          job.status === 'PUBLISHED'
                            ? 'bg-accent/15 text-accent'
                            : job.status === 'DRAFT'
                            ? 'bg-gray-dark text-text-secondary'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {STATUS_LABEL[job.status] ?? job.status}
                      </span>
                      <span>{JOB_TYPE_LABEL[job.job_type]}</span>
                      {salary && <span className="text-accent">{salary}</span>}
                      <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ar })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onManageApplicants(job)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-dark px-3 py-1.5 text-xs text-text hover:border-accent hover:text-accent"
                    >
                      <Users className="h-3.5 w-3.5" /> المتقدمون ({job.application_count})
                    </button>
                    <button
                      onClick={() => {
                        setEditJob(job)
                        setShowForm(true)
                      }}
                      className="rounded-lg border border-gray-dark p-1.5 text-text-secondary hover:border-accent hover:text-accent"
                      aria-label="تعديل"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove(job)}
                      disabled={del.isPending}
                      className="rounded-lg border border-gray-dark p-1.5 text-red-400 hover:border-red-400/60 hover:bg-red-500/10 disabled:opacity-50"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <JobFormModal
          companySlug={company.slug}
          job={editJob ?? undefined}
          onClose={() => {
            setShowForm(false)
            setEditJob(null)
          }}
        />
      )}
    </div>
  )
}
