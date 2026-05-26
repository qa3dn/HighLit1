'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  BadgeCheck,
  ExternalLink,
  Clock,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { useCurrentUser } from '@/hooks/useAuth'
import { useMyCompanies, useSubscription } from '@/hooks/useCompanies'
import { useMyJobs } from '@/hooks/useJobs'
import { CreateCompanyForm } from '@/components/company/CreateCompanyForm'
import { CompanyOverview } from '@/components/company/CompanyOverview'
import { CompanyJobsTab } from '@/components/company/CompanyJobsTab'
import { ApplicantsPanel } from '@/components/company/ApplicantsPanel'
import { SubscriptionTab } from '@/components/company/SubscriptionTab'
import { CompanySettings } from '@/components/company/CompanySettings'
import { CompanyMembers } from '@/components/company/CompanyMembers'
import type { Job } from '@/lib/api/jobs'

type Section = 'overview' | 'careers' | 'applicants' | 'subscription' | 'settings'

const NAV: { value: Section; label: string; icon: typeof Briefcase }[] = [
  { value: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { value: 'careers', label: 'الوظائف', icon: Briefcase },
  { value: 'applicants', label: 'المتقدمون', icon: Users },
  { value: 'subscription', label: 'الاشتراك', icon: CreditCard },
  { value: 'settings', label: 'الإعدادات', icon: SettingsIcon },
]

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-text">
      <div className="font-mono text-accent">{children}</div>
    </div>
  )
}

export function CompanyPortal() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const { data: companies, isLoading: companiesLoading } = useMyCompanies(!!currentUser)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [section, setSection] = useState<Section>('overview')
  const [applicantsJob, setApplicantsJob] = useState<Job | null>(null)

  const company = (companies ?? []).find((c) => c.slug === selectedSlug) ?? companies?.[0] ?? null
  const { data: allJobs } = useMyJobs(!!company)
  const companyJobs = (allJobs ?? []).filter((j) => j.company_profile === company?.id)
  const { data: sub } = useSubscription(company?.slug)

  if (userLoading) {
    return <Centered>جارٍ التحميل...</Centered>
  }
  if (!currentUser) {
    return <Centered>سجّل الدخول للوصول إلى بوابة الشركة.</Centered>
  }
  if (companiesLoading) {
    return <Centered>جارٍ التحميل...</Centered>
  }

  const openApplicants = (job: Job) => {
    setApplicantsJob(job)
    setSection('applicants')
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8" dir="rtl">
        {!company ? (
          <CreateCompanyForm />
        ) : (
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Sidebar */}
            <aside className="md:w-60 md:flex-shrink-0">
              <div className="mb-3 rounded-2xl border border-gray-dark bg-gray-light p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-dark bg-bg">
                    {company.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-secondary">
                        <Briefcase className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h1 className="truncate text-sm font-bold text-text">{company.name}</h1>
                      {company.is_verified && <BadgeCheck className="h-4 w-4 flex-shrink-0 text-accent" />}
                    </div>
                    {sub && <span className="text-[11px] text-accent">باقة {sub.limits.name}</span>}
                  </div>
                </div>

                {(companies ?? []).length > 1 && (
                  <select
                    value={company.slug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-gray-dark bg-bg px-2 py-1.5 text-xs text-text outline-none focus:border-accent"
                  >
                    {(companies ?? []).map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <nav className="flex gap-1 overflow-x-auto rounded-2xl md:flex-col md:border md:border-gray-dark md:bg-gray-light md:p-2">
                {NAV.map((item) => {
                  const Icon = item.icon
                  const active = section === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => setSection(item.value)}
                      className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg hover:text-text'
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {item.label}
                    </button>
                  )
                })}
              </nav>

              {company.status === 'APPROVED' && (
                <Link
                  href={`/company/${company.slug}`}
                  className="mt-3 hidden items-center gap-1.5 px-3 text-xs text-text-secondary hover:text-accent md:flex"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> عرض الصفحة العامة
                </Link>
              )}
            </aside>

            {/* Content */}
            <section className="min-w-0 flex-1">
              {company.status !== 'APPROVED' && (
                <div
                  className={`mb-5 rounded-xl border p-4 ${
                    company.status === 'REJECTED'
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'border-accent/40 bg-accent/5'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-text">
                    <Clock className="h-4 w-4 text-accent" />
                    {company.status === 'REJECTED' ? 'تم رفض طلب شركتك' : 'شركتك قيد المراجعة'}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {company.status === 'REJECTED'
                      ? company.review_note || 'يمكنك مراجعة البيانات والتواصل مع الإدارة.'
                      : 'سيراجع فريق المنصّة طلبك قريباً. ستتمكّن من نشر الوظائف بعد الموافقة.'}
                  </p>
                </div>
              )}
              {section === 'overview' && (
                <CompanyOverview company={company} jobs={companyJobs} onNavigate={setSection} />
              )}
              {section === 'careers' && (
                <CompanyJobsTab company={company} onManageApplicants={openApplicants} />
              )}
              {section === 'applicants' && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-text">المتقدمون</h2>
                  <ApplicantsPanel
                    key={applicantsJob?.id ?? 'first'}
                    jobs={companyJobs}
                    initialJobId={applicantsJob?.id}
                    onUpgrade={() => setSection('subscription')}
                  />
                </>
              )}
              {section === 'subscription' && (
                <>
                  <h2 className="mb-4 text-xl font-bold text-text">الاشتراك والباقة</h2>
                  <SubscriptionTab slug={company.slug} />
                </>
              )}
              {section === 'settings' && (
                <div className="space-y-8">
                  <CompanySettings company={company} />
                  <CompanyMembers company={company} />
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
