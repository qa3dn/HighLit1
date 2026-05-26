'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Copy, Eye, EyeOff, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CodeBlock } from '@/components/code/CodeBlock'
import { Window } from '@/components/terminal/Window'
import { playClickSound, playWindowOpenSound } from '@/lib/audio'
import {
  useCodeStorage,
  useCreateCodeStorage,
  useUpdateCodeStorage,
  useDeleteCodeStorage,
  CodeStorage as CodeStorageType,
} from '@/hooks/useRoom'

interface CodeStorageProps {
  userId: string
  isOwnProfile: boolean
}

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'css',
  'html',
  'json',
  'bash',
  'sql',
  'rust',
  'go',
]

export function CodeStorage({ userId, isOwnProfile }: CodeStorageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCode, setEditingCode] = useState<CodeStorageType | null>(null)
  const [selectedCode, setSelectedCode] = useState<CodeStorageType | null>(null)

  const { data: codes = [], isLoading } = useCodeStorage(isOwnProfile ? undefined : userId)
  const createMutation = useCreateCodeStorage()
  const updateMutation = useUpdateCodeStorage()
  const deleteMutation = useDeleteCodeStorage()

  const handleCreate = () => {
    playWindowOpenSound()
    setEditingCode(null)
    setIsModalOpen(true)
  }

  const handleEdit = (code: CodeStorageType) => {
    playWindowOpenSound()
    setEditingCode(code)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكود؟')) {
      playClickSound()
      await deleteMutation.mutateAsync(id)
    }
  }

  const handleCopy = (code: string) => {
    playClickSound()
    navigator.clipboard.writeText(code)
  }

  if (isLoading) {
    return (
      <Window title="مخزن الكود" path="~/code-storage">
        <div className="text-text-secondary text-center py-8 font-mono">
          جاري التحميل...
        </div>
      </Window>
    )
  }

  return (
    <>
      <Window title="مخزن الكود" path="~/code-storage">
        <div className="space-y-4">
          {isOwnProfile && (
            <div className="flex justify-end mb-4">
              <Button onClick={handleCreate} size="sm" variant="primary">
                <Plus className="w-4 h-4 ml-2" />
                خزّن كود
              </Button>
            </div>
          )}

          {codes.length === 0 ? (
            <div className="text-text-secondary text-center py-12 font-mono">
              <p className="mb-4">غرفتك فاضية... بلّش خزّن شغلك.</p>
              {isOwnProfile && (
                <Button onClick={handleCreate} variant="outline" size="sm">
                  خزّن أول كود
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className="border border-gray rounded-lg p-4 bg-bg hover:border-accent transition-all cursor-pointer"
                  onClick={() => setSelectedCode(code)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-mono text-accent font-bold mb-1">
                        {code.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
                        <span className="px-2 py-1 bg-gray rounded">
                          {code.language}
                        </span>
                        <span>
                          {code.visibility === 'PRIVATE' ? (
                            <EyeOff className="w-3 h-3 inline" />
                          ) : code.visibility === 'PUBLIC' ? (
                            <Eye className="w-3 h-3 inline" />
                          ) : (
                            <Share2 className="w-3 h-3 inline" />
                          )}
                        </span>
                        {code.tags && code.tags.length > 0 && (
                          <span className="text-accent">
                            {code.tags.length} tags
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwnProfile && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(code)}
                          className="p-1 hover:bg-gray rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-accent" />
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="p-1 hover:bg-gray rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  {code.description && (
                    <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                      {code.description}
                    </p>
                  )}
                  <div className="text-xs text-text-secondary font-mono">
                    {new Date(code.updated_at).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Window>

      {/* Code Detail Modal */}
      {selectedCode && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCode(null)}
        >
          <div
            className="bg-bg border border-accent rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-mono text-accent font-bold mb-2">
                    {selectedCode.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-text-secondary font-mono">
                    <span className="px-2 py-1 bg-gray rounded">
                      {selectedCode.language}
                    </span>
                    <span>{selectedCode.visibility}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCode(null)}
                  className="text-text-secondary hover:text-accent"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {selectedCode.description && (
                <p className="text-text-secondary mb-4">
                  {selectedCode.description}
                </p>
              )}
              <div className="mb-4">
                <div className="flex justify-end mb-2">
                  <Button
                    onClick={() => handleCopy(selectedCode.code_body)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 ml-2" />
                    نسخ
                  </Button>
                </div>
                <CodeBlock code={selectedCode.code_body} language={selectedCode.language} />
              </div>
              {selectedCode.notes && (
                <div className="mt-4 p-4 bg-gray rounded border border-accent/30">
                  <h3 className="font-mono text-accent mb-2">ملاحظاتي:</h3>
                  <p className="text-text-secondary whitespace-pre-wrap">
                    {selectedCode.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <CodeStorageModal
          code={editingCode}
          onClose={() => {
            setIsModalOpen(false)
            setEditingCode(null)
          }}
          onSave={async (data) => {
            if (editingCode) {
              await updateMutation.mutateAsync({ id: editingCode.id, code: data })
            } else {
              await createMutation.mutateAsync(data as any)
            }
            setIsModalOpen(false)
            setEditingCode(null)
          }}
        />
      )}
    </>
  )
}

interface CodeStorageModalProps {
  code: CodeStorageType | null
  onClose: () => void
  onSave: (data: Partial<CodeStorageType>) => void
}

function CodeStorageModal({ code, onSave, onClose }: CodeStorageModalProps) {
  const [title, setTitle] = useState(code?.title || '')
  const [language, setLanguage] = useState(code?.language || 'javascript')
  const [codeBody, setCodeBody] = useState(code?.code_body || '')
  const [description, setDescription] = useState(code?.description || '')
  const [tags, setTags] = useState(code?.tags?.join(', ') || '')
  const [visibility, setVisibility] = useState<
    'PRIVATE' | 'PUBLIC' | 'SHARED'
  >(code?.visibility || 'PRIVATE')
  const [notes, setNotes] = useState(code?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    onSave({
      title,
      language,
      code_body: codeBody,
      description: description || undefined,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : undefined,
      visibility,
      notes: notes || undefined,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg border border-accent rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-mono text-accent font-bold mb-6">
            {code ? 'تعديل الكود' : 'خزّن كود جديد'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-accent font-mono text-sm mb-2">
                العنوان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-accent font-mono text-sm mb-2">
                  اللغة
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-accent font-mono text-sm mb-2">
                  الرؤية
                </label>
                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as 'PRIVATE' | 'PUBLIC' | 'SHARED')
                  }
                  className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
                >
                  <option value="PRIVATE">خاص</option>
                  <option value="PUBLIC">عام</option>
                  <option value="SHARED">مشارك</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-accent font-mono text-sm mb-2">
                الكود
              </label>
              <textarea
                value={codeBody}
                onChange={(e) => setCodeBody(e.target.value)}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent min-h-[200px]"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-accent font-mono text-sm mb-2">
                الوصف (اختياري)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-accent font-mono text-sm mb-2">
                الوسوم (مفصولة بفواصل)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
                placeholder="javascript, react, hooks"
              />
            </div>
            <div>
              <label className="block text-accent font-mono text-sm mb-2">
                ملاحظاتي (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" variant="primary">
                حفظ
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

