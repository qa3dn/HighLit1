'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Download, Github, FileCode2, Lock, Globe, EyeOff, GitCommitHorizontal } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CodeBlock } from '@/components/code/CodeBlock'
import { useProject } from '@/hooks/useCodeProjects'
import { downloadProject } from '@/lib/api/codeProjects'
import { playClickSound } from '@/lib/audio'

const VIS = {
  PUBLIC: { label: 'عام', icon: Globe },
  UNLISTED: { label: 'غير مدرج', icon: EyeOff },
  PRIVATE: { label: 'خاص', icon: Lock },
} as const

function languageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx', py: 'python', java: 'java',
    rb: 'ruby', go: 'go', rs: 'rust', c: 'c', cpp: 'cpp', cs: 'csharp', php: 'php',
    css: 'css', html: 'html', json: 'json', md: 'markdown', sh: 'bash', sql: 'sql', yml: 'yaml', yaml: 'yaml',
  }
  return map[ext] ?? 'text'
}

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: project, isLoading, error } = useProject(slug)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selected = project?.files.find((f) => f.id === selectedId) ?? project?.files[0] ?? null

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8" dir="rtl">
        {isLoading ? (
          <p className="py-20 text-center text-text-secondary">جارٍ التحميل...</p>
        ) : error || !project ? (
          <div className="py-20 text-center">
            <p className="text-text-secondary">المشروع غير موجود أو خاص.</p>
            <Link href="/code" className="mt-3 inline-block text-accent hover:underline">
              العودة
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 border-b border-gray-dark pb-5">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-bold text-text">{project.name}</h1>
                {(() => {
                  const v = VIS[project.visibility]
                  const Icon = v.icon
                  return (
                    <span className="flex items-center gap-1 rounded-full border border-gray-dark px-2.5 py-0.5 text-xs text-text-secondary">
                      <Icon className="h-3.5 w-3.5" /> {v.label}
                    </span>
                  )
                })()}
              </div>
              {project.description && <p className="mb-3 text-text-secondary">{project.description}</p>}
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <Link href={`/profile/${project.owner_id}`} className="text-accent hover:underline">
                  @{project.author.username}
                </Link>
                {project.language && <span>· {project.language}</span>}
                <span>· {project.file_count} ملف</span>
                <span>· {project.view_count} مشاهدة</span>
              </div>
              {project.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-dark bg-gray-light px-2.5 py-0.5 font-mono text-xs text-accent">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    playClickSound()
                    downloadProject(project.slug)
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
                >
                  <Download className="h-4 w-4" /> تنزيل ZIP
                </button>
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-accent px-4 py-2 text-sm text-accent hover:bg-accent/10"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
                {project.linked_post && (
                  <Link
                    href="/rants"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-dark px-4 py-2 text-sm text-text-secondary hover:border-accent"
                  >
                    منشور مرتبط
                  </Link>
                )}
              </div>
            </div>

            {/* README */}
            {project.readme && (
              <section className="mb-8 rounded-2xl border border-gray-dark bg-gray-light p-6">
                <ReactMarkdown>{project.readme}</ReactMarkdown>
              </section>
            )}

            {/* Files */}
            {project.files.length > 0 && (
              <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1 md:col-span-1">
                  <h3 className="mb-2 font-mono text-sm text-text-secondary">الملفات</h3>
                  {project.files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedId(file.id)}
                      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-right font-mono text-xs transition-colors ${
                        selected?.id === file.id ? 'bg-accent/15 text-accent' : 'text-text hover:bg-gray-light'
                      }`}
                      dir="ltr"
                    >
                      <FileCode2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>
                <div className="md:col-span-2">
                  {selected && (
                    <>
                      <div className="mb-1 font-mono text-xs text-text-secondary" dir="ltr">
                        {selected.path}
                      </div>
                      <CodeBlock code={selected.content} language={languageFromPath(selected.path)} />
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Updates */}
            {project.updates.length > 0 && (
              <section className="mb-8">
                <h3 className="mb-3 font-mono text-sm text-text-secondary">سجل التحديثات</h3>
                <ul className="space-y-2">
                  {project.updates.map((u) => (
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
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
