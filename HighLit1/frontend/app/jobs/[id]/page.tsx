'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  MapPin,
  Briefcase,
  Star,
  BadgeCheck,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ApplyModal } from '@/components/jobs/ApplyModal'
import { useJob } from '@/hooks/useJobs'
import { useCurrentUser } from '@/hooks/useAuth'
import {
  JOB_TYPE_LABEL,
  WORKPLACE_LABEL,
  EXPERIENCE_LABEL,
  EMPLOYMENT_LABEL,
  formatSalary,
} from '@/lib/jobMeta'

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-dark bg-bg px-3 py-2">
      <div className="text-[11px] text-text-secondary">{label}</div>
      <div className="text-sm font-medium text-text">{value}</div>
    </div>
  )
}

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const { data: job, isLoading, error } = useJob(jobId)
  const { data: currentUser } = useCurrentUser()
  const [showApply, setShowApply] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8" dir="rtl">
        <Link href="/jobs" className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent">
          <ArrowRight className="h-4 w-4" /> كل الوظائف
        </Link>

        {isLoading ? (
          <p className="py-20 text-center text-text-secondary">جارٍ التحميل...</p>
        ) : error || !job ? (
          <div className="py-20 text-center">
            <p className="text-text-secondary">الوظيفة غير موجودة أو لم تعد متاحة.</p>
            <Link href="/jobs" className="mt-3 inline-block text-accent hover:underline">
              العودة للوظائف
            </Link>
          </div>
        ) : (
          (() => {
            const salary = formatSalary(job.min_salary, job.max_salary, job.currency)
            const company = job.company_detail
            const applyCta = job.has_applied ? (
              <button
                disabled
                className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent"
              >
                <CheckCircle2 className="h-4 w-4" /> تم التقديم
              </button>
            ) : !currentUser ? (
              <Link
                href="/login"
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover"
              >
                سجّل الدخول للتقديم
              </Link>
            ) : (
              <button
                onClick={() => setShowApply(true)}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover"
              >
                تقدّم الآن
              </button>
            )

            return (
              <>
                {/* Header card */}
                <div className="rounded-2xl border border-gray-dark bg-gray-light p-6">
                  <div className="flex gap-4">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-dark bg-bg">
                      {company?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-secondary">
                          <Briefcase className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold text-text">{job.title}</h1>
                        {job.is_featured && (
                          <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                            <Star className="h-3 w-3" /> مميّزة
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <span>{company?.name ?? job.company}</span>
                        {company?.is_verified && <BadgeCheck className="h-4 w-4 text-accent" />}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {job.application_count} متقدم
                        </span>
                        <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ar })}</span>
                      </div>
                    </div>
                  </div>

                  {salary && <p className="mt-4 text-lg font-bold text-accent">{salary}</p>}

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <MetaItem label="النوع" value={JOB_TYPE_LABEL[job.job_type]} />
                    <MetaItem label="الدوام" value={EMPLOYMENT_LABEL[job.employment_type]} />
                    <MetaItem label="مكان العمل" value={WORKPLACE_LABEL[job.workplace_type]} />
                    <MetaItem label="الخبرة" value={EXPERIENCE_LABEL[job.experience_level]} />
                  </div>

                  {job.application_deadline && (
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-text-secondary">
                      <Clock className="h-3.5 w-3.5" />
                      آخر موعد للتقديم: {new Date(job.application_deadline).toLocaleDateString('ar-EG')}
                    </p>
                  )}

                  <div className="mt-5">{applyCta}</div>
                </div>

                {/* Description */}
                <section className="mt-6 rounded-2xl border border-gray-dark bg-gray-light p-6">
                  <h2 className="mb-3 font-bold text-text">الوصف الوظيفي</h2>
                  <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">{job.description}</p>
                </section>

                {/* Skills */}
                {job.skills.length > 0 && (
                  <section className="mt-6 rounded-2xl border border-gray-dark bg-gray-light p-6">
                    <h2 className="mb-3 font-bold text-text">المهارات المطلوبة</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-gray-dark bg-bg px-3 py-1 font-mono text-xs text-accent"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} />}
              </>
            )
          })()
        )}
      </main>
      <Footer />
    </div>
  )
}
