'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useCreateProject } from '@/hooks/useStudentProjects'
import type { ProjectType } from '@/lib/api/studentProjects'
import { JORDAN_UNIVERSITIES, COMMON_MAJORS } from '@/lib/showcase/constants'
import { ShowcaseImageUploader } from './ShowcaseImageUploader'
import { ProjectCard } from './ProjectCard'
import { Button } from '@/components/ui/Button'
import { playClickSound } from '@/lib/audio'

const STEPS = ['أساسيات', 'المحتوى', 'التفاصيل', 'معاينة']

function inferProjectType(
  hasImages: boolean,
  hasGithub: boolean,
  hasVideo: boolean,
): ProjectType {
  const count = [hasImages, hasGithub, hasVideo].filter(Boolean).length
  if (count > 1) return 'MIXED'
  if (hasVideo) return 'VIDEO'
  if (hasGithub) return 'GITHUB'
  return 'IMAGE'
}

export function SubmitProjectWizard() {
  const router = useRouter()
  const createProject = useCreateProject()

  const { data: me } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data
    },
  })

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [techInput, setTechInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (me?.university) setUniversity(me.university)
    if (me?.major) setMajor(me.major)
  }, [me])

  const addTech = () => {
    const t = techInput.trim()
    if (t && !techStack.includes(t)) {
      setTechStack([...techStack, t])
      setTechInput('')
    }
  }

  const previewProject = {
    id: 0,
    user_id: me?.id || 0,
    author: {
      id: me?.id || 0,
      username: me?.username || 'أنت',
      avatar_url: me?.avatar_url,
      university,
      major,
    },
    title: title || 'عنوان المشروع',
    summary: summary || 'ملخص قصير',
    description,
    university: university || 'الجامعة',
    major: major || 'التخصص',
    academic_year: academicYear,
    project_type: inferProjectType(!!galleryImages.length, !!githubUrl, !!videoUrl),
    github_url: githubUrl,
    demo_url: demoUrl,
    video_url: videoUrl,
    cover_image: galleryImages[0] || '',
    gallery_images: galleryImages,
    tech_stack: techStack,
    tags: [],
    status: 'PUBLISHED' as const,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const canNext = () => {
    if (step === 0) return title.trim() && summary.trim() && university.trim() && major.trim()
    if (step === 1)
      return galleryImages.length > 0 || githubUrl.trim() || videoUrl.trim()
    if (step === 2) return description.trim().length >= 20
    return true
  }

  const handlePublish = async () => {
    playClickSound()
    setError(null)
    try {
      const project = await createProject.mutateAsync({
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        university: university.trim(),
        major: major.trim(),
        academic_year: academicYear.trim(),
        project_type: inferProjectType(!!galleryImages.length, !!githubUrl, !!videoUrl),
        github_url: githubUrl.trim(),
        demo_url: demoUrl.trim(),
        video_url: videoUrl.trim(),
        cover_image: galleryImages[0] || '',
        gallery_images: galleryImages,
        tech_stack: techStack,
      })
      router.push(`/code/${project.id}`)
    } catch {
      setError('تعذّر نشر المشروع. تحقق من تسجيل الدخول والبيانات.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl" dir="rtl">
      <div className="mb-8 flex gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-medium sm:text-sm ${
              i === step
                ? 'bg-accent text-bg'
                : i < step
                  ? 'bg-accent/20 text-accent'
                  : 'bg-gray-light text-text-secondary'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4 rounded-2xl border border-gray-dark bg-gray-light p-6">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">عنوان المشروع</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">ملخص قصير</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">الجامعة</label>
              <select
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text"
              >
                <option value="">اختر الجامعة</option>
                {JORDAN_UNIVERSITIES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">التخصص</label>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text"
              >
                <option value="">اختر التخصص</option>
                {COMMON_MAJORS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">السنة الدراسية (اختياري)</label>
            <input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2026"
              className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 rounded-2xl border border-gray-dark bg-gray-light p-6">
          <div>
            <h3 className="mb-2 font-semibold text-text">صور المشروع</h3>
            <ShowcaseImageUploader images={galleryImages} onImagesChange={setGalleryImages} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">رابط GitHub</label>
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              dir="ltr"
              className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">رابط تجربة مباشرة (اختياري)</label>
            <input
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">رابط فيديو (YouTube / Vimeo)</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              dir="ltr"
              className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 rounded-2xl border border-gray-dark bg-gray-light p-6">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">وصف تفصيلي للمشروع</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="اشرح الفكرة، التقنيات، دورك، والنتائج..."
              className="w-full rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">التقنيات المستخدمة</label>
            <div className="flex gap-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                className="flex-1 rounded-xl border border-gray-dark bg-bg px-4 py-2.5 text-text outline-none focus:border-accent"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTech}>
                إضافة
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {techStack.map((t) => (
                  <span
                    key={t}
                    className="cursor-pointer rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent"
                    onClick={() => setTechStack(techStack.filter((x) => x !== t))}
                  >
                    {t} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-center text-text-secondary">هكذا سيظهر مشروعك في المعرض:</p>
          <div className="max-w-sm mx-auto">
            <ProjectCard project={previewProject} />
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}

      <div className="mt-8 flex justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={step === 0}
          onClick={() => {
            playClickSound()
            setStep(step - 1)
          }}
        >
          السابق
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            variant="primary"
            disabled={!canNext()}
            onClick={() => {
              playClickSound()
              setStep(step + 1)
            }}
          >
            التالي
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            disabled={createProject.isPending}
            onClick={handlePublish}
          >
            {createProject.isPending ? 'جاري النشر...' : 'نشر المشروع'}
          </Button>
        )}
      </div>
    </div>
  )
}
