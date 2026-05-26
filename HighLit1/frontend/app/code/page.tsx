'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProjectCard } from '@/components/showcase/ProjectCard'
import { ProjectCardSkeleton } from '@/components/showcase/ProjectCardSkeleton'
import { ProjectFiltersBar } from '@/components/showcase/ProjectFilters'
import { useProjectFacets, useProjects } from '@/hooks/useStudentProjects'
import type { ProjectFilters } from '@/lib/api/studentProjects'
import { JORDAN_UNIVERSITIES, COMMON_MAJORS } from '@/lib/showcase/constants'
import { playClickSound } from '@/lib/audio'

export default function CodeShowcasePage() {
  const [filters, setFilters] = useState<ProjectFilters>({})
  const { data: projects, isLoading } = useProjects(filters)
  const { data: facets } = useProjectFacets()

  const universities = useMemo(() => {
    const fromApi = facets?.universities || []
    return Array.from(new Set([...JORDAN_UNIVERSITIES, ...fromApi]))
  }, [facets])

  const majors = useMemo(() => {
    const fromApi = facets?.majors || []
    return Array.from(new Set([...COMMON_MAJORS, ...fromApi]))
  }, [facets])

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      <Header />

      <section className="border-b border-white/10 bg-gradient-to-b from-accent/5 to-bg px-4 py-12 sm:py-16" dir="rtl">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-sm text-accent" dir="ltr">
            &gt; showcase.init()
          </p>
          <h1 className="mb-4 text-3xl font-bold text-text sm:text-4xl md:text-5xl">فرجينا شغلك</h1>
          <p className="mb-8 text-base text-text-secondary sm:text-lg">
            معرض مشاريع طلابية — شارك أعمالك كصور، فيديو، أو روابط GitHub مع تفاصيل جامعتك وتخصصك.
          </p>
          <Link
            href="/code/new"
            onClick={playClickSound}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-bg transition hover:bg-accent-hover hover:shadow-glow"
          >
            شارك مشروعك
          </Link>
        </div>
      </section>

      <ProjectFiltersBar
        filters={filters}
        onChange={setFilters}
        universities={universities}
        majors={majors}
      />

      <main className="container mx-auto px-4 py-10" dir="rtl">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-dark bg-gray-light py-16 text-center">
            <p className="text-lg text-text-secondary">لا توجد مشاريع مطابقة للفلاتر.</p>
            <Link href="/code/new" className="mt-4 inline-block text-accent hover:underline">
              كن أول من يشارك مشروعاً
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
