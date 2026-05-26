'use client'

import { useState } from 'react'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JobListCard } from '@/components/jobs/JobListCard'
import { useJobs } from '@/hooks/useJobs'
import type { JobType, Workplace, Experience } from '@/lib/api/jobs'
import { WORKPLACE_LABEL, EXPERIENCE_LABEL } from '@/lib/jobMeta'

const TYPE_TABS: { value: JobType | ''; label: string }[] = [
  { value: '', label: 'الكل' },
  { value: 'PAID', label: 'وظائف مدفوعة' },
  { value: 'INTERNSHIP', label: 'تدريب' },
  { value: 'FREELANCE', label: 'عمل حر' },
]

export default function JobsPage() {
  const [type, setType] = useState<JobType | ''>('')
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [location, setLocation] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [workplace, setWorkplace] = useState<Workplace | ''>('')
  const [experience, setExperience] = useState<Experience | ''>('')

  const { data: jobs, isLoading, error } = useJobs({ type, q, location, workplace, experience })

  const applySearch = () => {
    setQ(searchInput.trim())
    setLocation(locationInput.trim())
  }

  const resetFilters = () => {
    setType('')
    setQ('')
    setSearchInput('')
    setLocation('')
    setLocationInput('')
    setWorkplace('')
    setExperience('')
  }

  const selectClass =
    'rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent'

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">الوظائف والفرص</h1>
          <p className="mt-1 text-sm text-text-secondary">
            وظائف مدفوعة، فرص تدريب، وأعمال حرة من شركات المنصّة.
          </p>
        </div>

        {/* Type tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setType(tab.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                type === tab.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-gray-dark text-text-secondary hover:border-accent/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="mb-6 space-y-3 rounded-2xl border border-gray-dark bg-gray-light p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                placeholder="المسمى الوظيفي، الشركة، أو كلمة مفتاحية..."
                className="w-full rounded-lg border border-gray-dark bg-bg py-2 pr-9 pl-3 text-sm text-text outline-none focus:border-accent"
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                placeholder="الموقع"
                className="w-full rounded-lg border border-gray-dark bg-bg py-2 pr-9 pl-3 text-sm text-text outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={applySearch}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
            >
              بحث
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-text-secondary" />
            <select value={workplace} onChange={(e) => setWorkplace(e.target.value as Workplace | '')} className={selectClass}>
              <option value="">مكان العمل</option>
              {(Object.keys(WORKPLACE_LABEL) as Workplace[]).map((key) => (
                <option key={key} value={key}>
                  {WORKPLACE_LABEL[key]}
                </option>
              ))}
            </select>
            <select value={experience} onChange={(e) => setExperience(e.target.value as Experience | '')} className={selectClass}>
              <option value="">مستوى الخبرة</option>
              {(Object.keys(EXPERIENCE_LABEL) as Experience[]).map((key) => (
                <option key={key} value={key}>
                  {EXPERIENCE_LABEL[key]}
                </option>
              ))}
            </select>
            {(type || q || location || workplace || experience) && (
              <button onClick={resetFilters} className="text-xs text-text-secondary hover:text-accent">
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <p className="py-20 text-center text-text-secondary">جارٍ التحميل...</p>
        ) : error ? (
          <p className="py-20 text-center text-text-secondary">تعذّر تحميل الوظائف.</p>
        ) : !jobs || jobs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-text-secondary">لا توجد وظائف مطابقة.</p>
            {(type || q || location || workplace || experience) && (
              <button onClick={resetFilters} className="mt-3 text-accent hover:underline">
                إعادة ضبط البحث
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-text-secondary">{jobs.length} وظيفة</p>
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobListCard key={job.id} job={job} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
