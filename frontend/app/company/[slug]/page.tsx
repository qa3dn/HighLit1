'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  BadgeCheck,
  Briefcase,
  MapPin,
  Globe,
  Users,
  Building2,
  CalendarDays,
  Plus,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JobListCard } from '@/components/jobs/JobListCard'
import { JobCardSkeleton } from '@/components/jobs/JobCardSkeleton'
import { useCompany, useFollowCompany } from '@/hooks/useCompanies'
import { useCompanyJobs } from '@/hooks/useJobs'
import { useCurrentUser } from '@/hooks/useAuth'
import { SIZE_LABEL, safeExternalUrl, urlHost } from '@/lib/companyMeta'
import type { CompanyMember } from '@/lib/api/companies'

const ROLE_LABEL: Record<CompanyMember['role'], string> = {
  OWNER: 'المالك',
  ADMIN: 'مدير',
  EMPLOYEE: 'عضو الفريق',
}

function Avatar({ url, name, className }: { url?: string; name: string; className: string }) {
  const [failed, setFailed] = useState(false)
  if (url && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} onError={() => setFailed(true)} className={`${className} object-cover`} />
  }
  return (
    <span className={`${className} flex items-center justify-center bg-accent/10 font-bold text-accent`}>
      {(name?.[0] ?? '?').toUpperCase()}
    </span>
  )
}

function Fact({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-text-secondary">
      <Icon className="h-4 w-4 text-accent/70" aria-hidden />
      {children}
    </span>
  )
}

function CompanySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-40 w-full rounded-2xl bg-gray-light sm:h-52" />
      <div className="-mt-10 flex items-end gap-4 px-4 sm:px-6">
        <div className="h-24 w-24 rounded-2xl border-4 border-bg bg-gray" />
        <div className="mb-2 flex-1 space-y-2">
          <div className="h-5 w-1/3 rounded bg-gray" />
          <div className="h-3 w-1/2 rounded bg-gray" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    </div>
  )
}

export default function PublicCompanyPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: company, isLoading, error } = useCompany(slug)
  const { data: jobs, isLoading: jobsLoading } = useCompanyJobs(slug)
  const { data: currentUser } = useCurrentUser()
  const follow = useFollowCompany(slug)

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8" dir="rtl">
        {isLoading ? (
          <CompanySkeleton />
        ) : error || !company ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-dark bg-gray-light py-20 text-center">
            <AlertTriangle className="h-10 w-10 text-text-secondary/50" />
            <p className="text-text">الشركة غير موجودة أو غير متاحة.</p>
            <Link href="/jobs" className="text-sm text-accent hover:underline">
              تصفّح كل الوظائف
            </Link>
          </div>
        ) : (
          <>
            {/* Hero */}
            <section>
              <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-gray-dark bg-gradient-to-l from-accent/10 via-gray-light to-bg sm:h-52">
                {company.banner_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.banner_url} alt="" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent" />
              </div>

              <div className="relative z-10 -mt-12 flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:px-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-bg bg-gray-light shadow-glow">
                  {company.logo_url ? (
                    <Avatar url={company.logo_url} name={company.name} className="h-full w-full" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-text-secondary">
                      <Briefcase className="h-9 w-9" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 sm:pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-2xl font-bold text-text">{company.name}</h1>
                    {company.is_verified && (
                      <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent" title="شركة موثّقة">
                        <BadgeCheck className="h-4 w-4" aria-label="شركة موثّقة" /> موثّقة
                      </span>
                    )}
                  </div>
                  {company.tagline && <p className="mt-0.5 text-sm text-text-secondary">{company.tagline}</p>}
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    <span className="font-mono text-text">{company.follower_count}</span> متابع
                  </p>
                </div>

                {/* CTA cluster */}
                <div className="flex flex-shrink-0 gap-2 sm:pb-1">
                  {currentUser ? (
                    <button
                      onClick={() => follow.mutate(company.is_following ?? false)}
                      disabled={follow.isPending}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        company.is_following
                          ? 'border border-gray-dark bg-gray-light text-text hover:border-accent/40'
                          : 'bg-accent text-bg hover:bg-accent-hover'
                      }`}
                    >
                      {follow.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : company.is_following ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {company.is_following ? 'متابَع' : 'متابعة'}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
                    >
                      <Plus className="h-4 w-4" /> متابعة
                    </Link>
                  )}
                  {safeExternalUrl(company.website) && (
                    <a
                      href={safeExternalUrl(company.website)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-gray-dark px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      <Globe className="h-4 w-4" /> الموقع
                    </a>
                  )}
                </div>
              </div>
            </section>

            {/* Key facts */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-gray-dark bg-gray-light px-5 py-3">
              {company.industry && <Fact icon={Building2}>{company.industry}</Fact>}
              {company.size && SIZE_LABEL[company.size] && <Fact icon={Users}>{SIZE_LABEL[company.size]}</Fact>}
              {company.founded_year && <Fact icon={CalendarDays}>تأسست عام {company.founded_year}</Fact>}
              {company.location && <Fact icon={MapPin}>{company.location}</Fact>}
              {urlHost(company.website) && (
                <a
                  href={safeExternalUrl(company.website)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                  dir="ltr"
                >
                  <Globe className="h-4 w-4" aria-hidden /> {urlHost(company.website)}
                </a>
              )}
            </div>

            {/* About */}
            {company.about && (
              <section className="mt-6 rounded-2xl border border-gray-dark bg-gray-light p-6">
                <h2 className="mb-2 text-sm font-bold text-text">نبذة عن الشركة</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">{company.about}</p>
              </section>
            )}

            {/* Team */}
            {company.members.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-sm font-bold text-text">الفريق</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {company.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-dark bg-gray-light p-3"
                    >
                      <Avatar url={m.avatar_url} name={m.username} className="h-10 w-10 rounded-full border border-gray-dark" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text">{m.username}</p>
                        <p className="truncate text-xs text-text-secondary">{m.title || ROLE_LABEL[m.role]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Media gallery */}
            {company.media.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-sm font-bold text-text">معرض الشركة</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {company.media.map((item) => (
                    <figure key={item.id} className="overflow-hidden rounded-xl border border-gray-dark bg-gray-light">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.caption || company.name} className="h-32 w-full object-cover" />
                      {item.caption && (
                        <figcaption className="truncate px-2 py-1 text-[11px] text-text-secondary">{item.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {/* Jobs */}
            <section className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
                الوظائف المتاحة
                {jobs && jobs.length > 0 && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{jobs.length}</span>
                )}
              </h2>
              {jobsLoading ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </div>
              ) : !jobs || jobs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-dark bg-gray-light py-12 text-center">
                  <Briefcase className="h-8 w-8 text-text-secondary/50" />
                  <p className="text-sm text-text-secondary">لا توجد وظائف منشورة حالياً.</p>
                  <Link href="/jobs" className="text-sm text-accent hover:underline">
                    تصفّح كل الوظائف
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {jobs.map((job) => (
                    <JobListCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
