'use client'

import { useState } from 'react'
import { Search, MapPin, SlidersHorizontal, X, RotateCcw, AlertTriangle, Briefcase } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JobListCard } from '@/components/jobs/JobListCard'
import { JobCardSkeleton } from '@/components/jobs/JobCardSkeleton'
import { useJobs } from '@/hooks/useJobs'
import { useDebounce } from '@/hooks/useDebounce'
import type { JobType, Workplace, Experience } from '@/lib/api/jobs'
import { WORKPLACE_LABEL, EXPERIENCE_LABEL } from '@/lib/jobMeta'

const TYPE_TABS: { value: JobType | ''; label: string }[] = [
  { value: '', label: 'الكل' },
  { value: 'PAID', label: 'وظائف مدفوعة' },
  { value: 'INTERNSHIP', label: 'تدريب' },
  { value: 'FREELANCE', label: 'عمل حر' },
]

const SELECT_CLASS =
  'rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none transition-colors focus:border-accent'

function jobCountLabel(n: number): string {
  if (n === 1) return 'وظيفة واحدة'
  if (n === 2) return 'وظيفتان'
  if (n >= 3 && n <= 10) return `${n} وظائف`
  return `${n} وظيفة`
}

export default function JobsPage() {
  const [type, setType] = useState<JobType | ''>('')
  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')
  const [workplace, setWorkplace] = useState<Workplace | ''>('')
  const [experience, setExperience] = useState<Experience | ''>('')

  const debouncedQ = useDebounce(q.trim())
  const debouncedLocation = useDebounce(location.trim())

  const { data: jobs, isLoading, isError, isFetching, refetch } = useJobs({
    type,
    q: debouncedQ,
    location: debouncedLocation,
    workplace,
    experience,
  })

  const hasActiveFilters = Boolean(type || q || location || workplace || experience)

  const chips: { key: string; label: string; clear: () => void }[] = []
  if (q) chips.push({ key: 'q', label: `بحث: ${q}`, clear: () => setQ('') })
  if (location) chips.push({ key: 'loc', label: location, clear: () => setLocation('') })
  if (workplace) chips.push({ key: 'wp', label: WORKPLACE_LABEL[workplace], clear: () => setWorkplace('') })
  if (experience) chips.push({ key: 'exp', label: EXPERIENCE_LABEL[experience], clear: () => setExperience('') })

  const resetFilters = () => {
    setType('')
    setQ('')
    setLocation('')
    setWorkplace('')
    setExperience('')
  }

  const results = jobs ?? []

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-8" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text sm:text-3xl">الوظائف والفرص</h1>
          <p className="mt-1 text-sm text-text-secondary">
            وظائف مدفوعة، فرص تدريب، وأعمال حرة من شركات المنصّة.
          </p>
        </div>

        {/* Sticky search + filters toolbar */}
        <div className="sticky top-14 z-30 -mx-4 mb-5 border-b border-gray-dark bg-bg/85 px-4 pb-4 pt-1 backdrop-blur-xl sm:top-16">
          {/* Type segmented control */}
          <div className="mb-3 flex flex-wrap gap-2">
            {TYPE_TABS.map((tab) => {
              const active = type === tab.value
              return (
                <button
                  key={tab.label}
                  onClick={() => setType(tab.value)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-gray-dark text-text-secondary hover:border-accent/40 hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search row */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="البحث عن وظيفة"
                placeholder="المسمى الوظيفي، الشركة، أو كلمة مفتاحية..."
                className="w-full rounded-lg border border-gray-dark bg-gray-light py-2.5 ps-9 pe-3 text-sm text-text outline-none transition-colors focus:border-accent"
              />
            </div>
            <div className="relative sm:w-56">
              <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                aria-label="الموقع"
                placeholder="الموقع"
                className="w-full rounded-lg border border-gray-dark bg-gray-light py-2.5 ps-9 pe-3 text-sm text-text outline-none transition-colors focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-text-secondary sm:hidden" aria-hidden />
              <select
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value as Workplace | '')}
                aria-label="مكان العمل"
                className={`${SELECT_CLASS} flex-1`}
              >
                <option value="">مكان العمل</option>
                {(Object.keys(WORKPLACE_LABEL) as Workplace[]).map((key) => (
                  <option key={key} value={key}>
                    {WORKPLACE_LABEL[key]}
                  </option>
                ))}
              </select>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as Experience | '')}
                aria-label="مستوى الخبرة"
                className={`${SELECT_CLASS} flex-1`}
              >
                <option value="">مستوى الخبرة</option>
                {(Object.keys(EXPERIENCE_LABEL) as Experience[]).map((key) => (
                  <option key={key} value={key}>
                    {EXPERIENCE_LABEL[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.clear}
                  className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent transition-colors hover:bg-accent/20"
                >
                  {chip.label}
                  <X className="h-3 w-3" aria-hidden />
                </button>
              ))}
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-text-secondary transition-colors hover:text-accent"
              >
                <RotateCcw className="h-3 w-3" aria-hidden /> مسح الكل
              </button>
            </div>
          )}
        </div>

        {/* Result count */}
        {!isLoading && !isError && (
          <p className="mb-3 text-sm text-text-secondary" aria-live="polite">
            {results.length > 0 ? jobCountLabel(results.length) : 'لا نتائج'}
            {isFetching && <span className="ms-2 text-accent/70">…تحديث</span>}
          </p>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-red-400" />
            <p className="text-text">تعذّر تحميل الوظائف.</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-dark bg-gray-light py-16 text-center">
            <Briefcase className="h-10 w-10 text-text-secondary/50" />
            <p className="text-text">
              {hasActiveFilters ? 'لا توجد وظائف مطابقة لبحثك.' : 'لا توجد وظائف منشورة حالياً.'}
            </p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-sm text-accent hover:underline">
                إعادة ضبط البحث
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((job) => (
              <JobListCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
