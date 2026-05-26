'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ImageGallery } from '@/components/showcase/ImageGallery'
import { VideoEmbed } from '@/components/showcase/VideoEmbed'
import { GitHubBlock } from '@/components/showcase/GitHubBlock'
import { useDeleteProject, useProject } from '@/hooks/useStudentProjects'
import { api } from '@/lib/api'
import { PROJECT_TYPE_LABELS } from '@/lib/showcase/constants'
import { Button } from '@/components/ui/Button'
import { playClickSound } from '@/lib/audio'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: project, isLoading, error } = useProject(id)
  const deleteProject = useDeleteProject()

  const { data: me } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) return null
      const { data } = await api.get('/auth/me')
      return data
    },
    enabled: typeof window !== 'undefined',
  })

  const isOwner = me && project && me.id === project.user_id
  const isAdmin = me?.role === 'ADMIN'

  const handleDelete = async () => {
    if (!project || !confirm('حذف هذا المشروع؟')) return
    playClickSound()
    await deleteProject.mutateAsync(project.id)
    router.push('/code')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center text-text-secondary">
          جاري التحميل...
        </main>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center" dir="rtl">
          <p className="text-text-secondary">المشروع غير موجود أو غير متاح.</p>
          <Link href="/code" className="mt-4 inline-block text-accent hover:underline">
            العودة للمعرض
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      <Header />

      <article className="container mx-auto max-w-4xl px-4 py-8 sm:py-12" dir="rtl">
        {project.cover_image && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-dark">
            <img
              src={project.cover_image}
              alt={project.title}
              className="aspect-[21/9] w-full object-cover"
            />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-xs text-accent">
              {PROJECT_TYPE_LABELS[project.project_type]}
            </span>
            <h1 className="text-2xl font-bold text-text sm:text-4xl">{project.title}</h1>
            <p className="mt-2 text-text-secondary">{project.summary}</p>
          </div>
          {(isOwner || isAdmin) && (
            <div className="flex gap-2">
              {isOwner && (
                <Button variant="secondary" size="sm" onClick={handleDelete}>
                  حذف
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <Link
            href={`/profile/${project.author.id}`}
            className="font-medium text-accent hover:underline"
          >
            @{project.author.username}
          </Link>
          <span>·</span>
          <span>{project.university}</span>
          <span>·</span>
          <span>{project.major}</span>
          {project.academic_year && (
            <>
              <span>·</span>
              <span>{project.academic_year}</span>
            </>
          )}
        </div>

        {project.tech_stack?.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-gray-dark bg-gray-light px-3 py-1 font-mono text-xs text-accent"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.description && (
          <section className="mb-10 rounded-2xl border border-gray-dark bg-gray-light p-6">
            <h2 className="mb-4 text-lg font-semibold text-text">عن المشروع</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">
              {project.description}
            </p>
          </section>
        )}

        {project.gallery_images?.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-text">معرض الصور</h2>
            <ImageGallery images={project.gallery_images} title={project.title} />
          </section>
        )}

        {project.video_url && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-text">فيديو العرض</h2>
            <VideoEmbed url={project.video_url} title={project.title} />
          </section>
        )}

        {project.github_url && (
          <section className="mb-10">
            <GitHubBlock githubUrl={project.github_url} demoUrl={project.demo_url} />
          </section>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/code"
            onClick={playClickSound}
            className="text-accent hover:underline"
          >
            ← العودة لمعرض المشاريع
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  )
}
