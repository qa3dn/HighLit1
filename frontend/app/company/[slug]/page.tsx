'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Briefcase, MapPin, Globe, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JobListCard } from '@/components/jobs/JobListCard'
import { useCompany } from '@/hooks/useCompanies'
import { useCompanyJobs } from '@/hooks/useJobs'

export default function PublicCompanyPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: company, isLoading, error } = useCompany(slug)
  const { data: jobs } = useCompanyJobs(slug)

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8" dir="rtl">
        {isLoading ? (
          <p className="py-20 text-center text-text-secondary">جارٍ التحميل...</p>
        ) : error || !company ? (
          <div className="py-20 text-center">
            <p className="text-text-secondary">الشركة غير موجودة أو غير متاحة.</p>
            <Link href="/jobs" className="mt-3 inline-block text-accent hover:underline">
              تصفّح الوظائف
            </Link>
          </div>
        ) : (
          <>
            {/* Banner */}
            {company.banner_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.banner_url}
                alt=""
                className="mb-4 h-40 w-full rounded-2xl border border-gray-dark object-cover"
              />
            )}

            {/* Header */}
            <div className="rounded-2xl border border-gray-dark bg-gray-light p-6">
              <div className="flex gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-dark bg-bg">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-secondary">
                      <Briefcase className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-text">{company.name}</h1>
                    {company.is_verified && <BadgeCheck className="h-5 w-5 text-accent" />}
                  </div>
                  {company.tagline && <p className="text-sm text-text-secondary">{company.tagline}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    {company.industry && <span>{company.industry}</span>}
                    {company.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {company.location}
                      </span>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-accent hover:underline"
                        dir="ltr"
                      >
                        <Globe className="h-3.5 w-3.5" /> الموقع
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {company.follower_count} متابع
                    </span>
                  </div>
                </div>
              </div>
              {company.about && (
                <p className="mt-4 whitespace-pre-wrap leading-relaxed text-text-secondary">{company.about}</p>
              )}
            </div>

            {/* Jobs */}
            <section className="mt-6">
              <h2 className="mb-3 font-bold text-text">الوظائف المتاحة</h2>
              {!jobs || jobs.length === 0 ? (
                <p className="rounded-2xl border border-gray-dark bg-gray-light py-12 text-center text-sm text-text-secondary">
                  لا توجد وظائف منشورة حالياً.
                </p>
              ) : (
                <div className="space-y-3">
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
