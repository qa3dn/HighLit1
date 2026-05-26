'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  ArrowRight,
  Download,
  Trash2,
  Plus,
  FileCode2,
  GitCommitHorizontal,
  Github,
  Save,
} from 'lucide-react'
import { Window } from '@/components/terminal/Window'
import { Button } from '@/components/ui/Button'
import {
  useAddFile,
  useAddUpdate,
  useDeleteFile,
  useDeleteProject,
  useProject,
  useUpdateFile,
  useUpdateProject,
} from '@/hooks/useCodeProjects'
import { downloadProject } from '@/lib/api/codeProjects'
import { playClickSound } from '@/lib/audio'
import type { ProjectVisibility } from '@/lib/api/codeProjects'

type Tab = 'files' | 'readme' | 'updates' | 'settings'

interface ProjectWorkspaceDetailProps {
  slug: string
  onBack: () => void
}

export function ProjectWorkspaceDetail({ slug, onBack }: ProjectWorkspaceDetailProps) {
  const { data: project, isLoading } = useProject(slug)
  const [tab, setTab] = useState<Tab>('files')

  if (isLoading || !project) {
    return (
      <Window title="مشروع" path={`~/projects/${slug}`}>
        <p className="py-10 text-center font-mono text-text-secondary">جارٍ التحميل...</p>
      </Window>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'files', label: `الملفات (${project.files.length})` },
    { id: 'readme', label: 'README' },
    { id: 'updates', label: `التحديثات (${project.updates.length})` },
    { id: 'settings', label: 'الإعدادات' },
  ]

  return (
    <Window title={project.name} path={`~/projects/${project.slug}`}>
      <div dir="rtl">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray pb-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent">
            <ArrowRight className="h-4 w-4" /> رجوع
          </button>
          <div className="flex items-center gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-gray-dark px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
            <button
              onClick={() => {
                playClickSound()
                downloadProject(project.slug)
              }}
              className="flex items-center gap-1 rounded-lg border border-gray-dark px-3 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent"
            >
              <Download className="h-4 w-4" /> تنزيل ZIP
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap gap-1 border-b border-gray-dark">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-3 py-2 font-mono text-sm transition-colors ${
                tab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'files' && <FilesTab slug={slug} files={project.files} />}
        {tab === 'readme' && <ReadmeTab slug={slug} readme={project.readme} />}
        {tab === 'updates' && <UpdatesTab slug={slug} updates={project.updates} />}
        {tab === 'settings' && <SettingsTab project={project} onDeleted={onBack} />}
      </div>
    </Window>
  )
}

function FilesTab({ slug, files }: { slug: string; files: { id: number; path: string; content: string }[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(files[0]?.id ?? null)
  const [draft, setDraft] = useState('')
  const [newPath, setNewPath] = useState('')
  const [adding, setAdding] = useState(false)
  const addFile = useAddFile(slug)
  const updateFile = useUpdateFile(slug)
  const deleteFile = useDeleteFile(slug)

  const selected = files.find((f) => f.id === selectedId) ?? null

  useEffect(() => {
    setDraft(selected?.content ?? '')
  }, [selected?.id, selected?.content])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* File list */}
      <div className="space-y-1 md:col-span-1">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => setSelectedId(file.id)}
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-right font-mono text-xs transition-colors ${
              selectedId === file.id ? 'bg-accent/15 text-accent' : 'text-text hover:bg-gray'
            }`}
            dir="ltr"
          >
            <FileCode2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{file.path}</span>
          </button>
        ))}

        {adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newPath.trim()) return
              addFile.mutate(
                { path: newPath.trim(), content: '' },
                {
                  onSuccess: (file) => {
                    setSelectedId(file.id)
                    setNewPath('')
                    setAdding(false)
                  },
                },
              )
            }}
            className="flex gap-1 pt-2"
          >
            <input
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              placeholder="src/index.ts"
              dir="ltr"
              autoFocus
              className="flex-1 rounded border border-gray-dark bg-gray px-2 py-1 font-mono text-xs text-text outline-none focus:border-accent"
            />
            <Button type="submit" size="sm" variant="primary" disabled={addFile.isPending}>
              ✓
            </Button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-2 flex w-full items-center gap-1 rounded border border-dashed border-gray-dark px-2 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent"
          >
            <Plus className="h-3.5 w-3.5" /> ملف جديد
          </button>
        )}
      </div>

      {/* File editor */}
      <div className="md:col-span-2">
        {selected ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-text-secondary" dir="ltr">
                {selected.path}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={updateFile.isPending || draft === selected.content}
                  onClick={() => updateFile.mutate({ fileId: selected.id, content: draft })}
                >
                  <Save className="ml-1 h-3.5 w-3.5" /> حفظ
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (confirm('حذف هذا الملف؟')) {
                      deleteFile.mutate(selected.id, { onSuccess: () => setSelectedId(null) })
                    }
                  }}
                  className="text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              dir="ltr"
              spellCheck={false}
              className="h-72 w-full rounded-lg border border-gray-dark bg-gray-light p-3 font-mono text-sm text-text outline-none focus:border-accent"
            />
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-gray-dark text-sm text-text-secondary">
            اختر ملفاً أو أضف ملفاً جديداً
          </div>
        )}
      </div>
    </div>
  )
}

function ReadmeTab({ slug, readme }: { slug: string; readme: string }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(readme)
  const update = useUpdateProject(slug)

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              variant="primary"
              disabled={update.isPending}
              onClick={() => update.mutate({ readme: draft }, { onSuccess: () => setEditing(false) })}
            >
              <Save className="ml-1 h-3.5 w-3.5" /> حفظ
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setDraft(readme); setEditing(false) }}>
              إلغاء
            </Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            تعديل
          </Button>
        )}
      </div>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          dir="ltr"
          className="h-72 w-full rounded-lg border border-gray-dark bg-gray-light p-3 font-mono text-sm text-text outline-none focus:border-accent"
        />
      ) : readme ? (
        <div className="prose-rant rounded-lg border border-gray-dark bg-gray-light p-4 leading-relaxed text-text" dir="auto">
          <ReactMarkdown>{readme}</ReactMarkdown>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-text-secondary">لا يوجد README بعد.</p>
      )}
    </div>
  )
}

function UpdatesTab({ slug, updates }: { slug: string; updates: { id: number; message: string; created_at: string }[] }) {
  const [message, setMessage] = useState('')
  const addUpdate = useAddUpdate(slug)

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!message.trim()) return
          addUpdate.mutate(message.trim(), { onSuccess: () => setMessage('') })
        }}
        className="flex gap-2"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="رسالة التحديث (مثل: أضفت ميزة X)"
          maxLength={200}
          className="flex-1 rounded-lg border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
        <Button type="submit" size="sm" variant="primary" disabled={addUpdate.isPending || !message.trim()}>
          تسجيل
        </Button>
      </form>
      {updates.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">لا تحديثات بعد.</p>
      ) : (
        <ul className="space-y-2">
          {updates.map((u) => (
            <li key={u.id} className="flex items-start gap-3 rounded-lg border border-gray-dark bg-gray-light p-3">
              <GitCommitHorizontal className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
              <div>
                <p className="text-sm text-text">{u.message}</p>
                <p className="text-xs text-text-secondary">
                  {formatDistanceToNow(new Date(u.created_at), { addSuffix: true, locale: ar })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SettingsTab({
  project,
  onDeleted,
}: {
  project: { slug: string; name: string; description: string; language: string; tags: string[]; visibility: ProjectVisibility; github_url: string }
  onDeleted: () => void
}) {
  const update = useUpdateProject(project.slug)
  const remove = useDeleteProject()
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    language: project.language,
    tags: project.tags.join(', '),
    visibility: project.visibility,
    github_url: project.github_url,
  })

  return (
    <div className="space-y-4">
      <Field label="الاسم">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
      </Field>
      <Field label="الوصف">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="اللغة / المنصّة">
          <input
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
        </Field>
        <Field label="الظهور">
          <select
            value={form.visibility}
            onChange={(e) => setForm({ ...form, visibility: e.target.value as ProjectVisibility })}
            className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
          >
            <option value="PUBLIC">عام</option>
            <option value="UNLISTED">غير مدرج</option>
            <option value="PRIVATE">خاص</option>
          </select>
        </Field>
      </div>
      <Field label="الوسوم (مفصولة بفواصل)">
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full rounded border border-gray-dark bg-gray px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
      </Field>
      <Field label="رابط GitHub">
        <input
          value={form.github_url}
          onChange={(e) => setForm({ ...form, github_url: e.target.value })}
          dir="ltr"
          className="w-full rounded border border-gray-dark bg-gray px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent"
        />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="primary"
          disabled={update.isPending}
          onClick={() =>
            update.mutate({
              name: form.name.trim(),
              description: form.description.trim(),
              language: form.language.trim(),
              tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
              visibility: form.visibility,
              github_url: form.github_url.trim(),
            })
          }
        >
          {update.isPending ? '...جارٍ' : 'حفظ الإعدادات'}
        </Button>
        <Button
          variant="secondary"
          className="text-red-400"
          onClick={() => {
            if (confirm('حذف المشروع نهائياً؟')) {
              remove.mutate(project.slug, { onSuccess: onDeleted })
            }
          }}
        >
          <Trash2 className="ml-1 h-4 w-4" /> حذف المشروع
        </Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  )
}
