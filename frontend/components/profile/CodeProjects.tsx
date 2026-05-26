'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Plus, FolderGit2, FileCode2, Lock, Globe, EyeOff } from 'lucide-react'
import { Window } from '@/components/terminal/Window'
import { Button } from '@/components/ui/Button'
import { ProjectWorkspaceDetail } from './ProjectWorkspaceDetail'
import { useCreateProject, useMyProjects } from '@/hooks/useCodeProjects'
import { playClickSound, playWindowOpenSound } from '@/lib/audio'
import type { ProjectVisibility } from '@/lib/api/codeProjects'

const VISIBILITY_META: Record<ProjectVisibility, { label: string; icon: typeof Lock }> = {
  PUBLIC: { label: 'عام', icon: Globe },
  UNLISTED: { label: 'غير مدرج', icon: EyeOff },
  PRIVATE: { label: 'خاص', icon: Lock },
}

interface CodeProjectsProps {
  isOwnProfile: boolean
}

export function CodeProjects({ isOwnProfile }: CodeProjectsProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const { data: projects = [], isLoading } = useMyProjects()

  if (!isOwnProfile) {
    return (
      <Window title="مخزن الكود" path="~/projects">
        <p className="py-8 text-center font-mono text-text-secondary">
          مستودعات هذا المستخدم العامة تظهر في ملفه الشخصي.
        </p>
      </Window>
    )
  }

  if (selectedSlug) {
    return <ProjectWorkspaceDetail slug={selectedSlug} onBack={() => setSelectedSlug(null)} />
  }

  return (
    <Window title="مخزن الكود — مستودعاتي" path="~/projects">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            مشاريع متعددة الملفات بنمط مستودعات احترافي.
          </p>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              playWindowOpenSound()
              setShowCreate(true)
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            مشروع جديد
          </Button>
        </div>

        {isLoading ? (
          <p className="py-8 text-center font-mono text-text-secondary">جارٍ التحميل...</p>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-gray py-12 text-center font-mono text-text-secondary">
            <FolderGit2 className="mx-auto mb-3 h-10 w-10 text-accent/50" />
            <p className="mb-4">لا مستودعات بعد — أنشئ أول مشروع لك.</p>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
              إنشاء مشروع
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {projects.map((project) => {
              const meta = VISIBILITY_META[project.visibility]
              const VisIcon = meta.icon
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    playClickSound()
                    setSelectedSlug(project.slug)
                  }}
                  className="rounded-lg border border-gray bg-bg p-4 text-right transition-all hover:border-accent"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-accent" />
                      <span className="font-mono font-bold text-accent">{project.name}</span>
                    </div>
                    <span className="flex items-center gap-1 rounded border border-gray-dark px-1.5 py-0.5 text-[10px] text-text-secondary">
                      <VisIcon className="h-3 w-3" />
                      {meta.label}
                    </span>
                  </div>
                  {project.description && (
                    <p className="mb-2 line-clamp-2 text-sm text-text-secondary">{project.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    {project.language && <span className="text-accent">{project.language}</span>}
                    <span className="flex items-center gap-1">
                      <FileCode2 className="h-3.5 w-3.5" /> {project.file_count}
                    </span>
                    <span className="mr-auto">
                      {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={(slug) => {
            setShowCreate(false)
            setSelectedSlug(slug)
          }}
        />
      )}
    </Window>
  )
}

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (slug: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState('')
  const [tags, setTags] = useState('')
  const [visibility, setVisibility] = useState<ProjectVisibility>('PUBLIC')
  const [githubUrl, setGithubUrl] = useState('')
  const create = useCreateProject()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    playClickSound()
    create.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        language: language.trim(),
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        visibility,
        github_url: githubUrl.trim(),
        readme: `# ${name.trim()}\n\n${description.trim()}`,
      },
      { onSuccess: (project) => onCreated(project.slug) },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border border-accent bg-bg p-6"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h2 className="mb-5 font-mono text-xl font-bold text-accent">مشروع جديد</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Labeled label="اسم المشروع">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border border-gray-dark bg-gray px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent"
            />
          </Labeled>
          <Labeled label="الوصف">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </Labeled>
          <div className="grid grid-cols-2 gap-4">
            <Labeled label="اللغة / المنصّة">
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="TypeScript, React"
                className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
            </Labeled>
            <Labeled label="الظهور">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}
                className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
              >
                <option value="PUBLIC">عام</option>
                <option value="UNLISTED">غير مدرج (بالرابط)</option>
                <option value="PRIVATE">خاص</option>
              </select>
            </Labeled>
          </div>
          <Labeled label="الوسوم (مفصولة بفواصل)">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, api"
              className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </Labeled>
          <Labeled label="رابط GitHub (اختياري)">
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              dir="ltr"
              placeholder="https://github.com/user/repo"
              className="w-full rounded border border-gray-dark bg-gray px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent"
            />
          </Labeled>
          {create.isError && <p className="text-sm text-red-400">تعذّر إنشاء المشروع.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" disabled={create.isPending || !name.trim()}>
              {create.isPending ? '...جارٍ' : 'إنشاء'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  )
}
