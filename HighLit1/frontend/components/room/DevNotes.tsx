'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Window } from '@/components/terminal/Window'
import { playClickSound, playWindowOpenSound } from '@/lib/audio'
import {
  useDevNotes,
  useCreateDevNote,
  useUpdateDevNote,
  useDeleteDevNote,
  DevNote as DevNoteType,
} from '@/hooks/useRoom'

interface DevNotesProps {
  isOwnProfile: boolean
}

export function DevNotes({ isOwnProfile }: DevNotesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<DevNoteType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: notes = [], isLoading } = useDevNotes()
  const createMutation = useCreateDevNote()
  const updateMutation = useUpdateDevNote()
  const deleteMutation = useDeleteDevNote()

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreate = () => {
    playWindowOpenSound()
    setEditingNote(null)
    setIsModalOpen(true)
  }

  const handleEdit = (note: DevNoteType) => {
    playWindowOpenSound()
    setEditingNote(note)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
      playClickSound()
      await deleteMutation.mutateAsync(id)
    }
  }

  if (!isOwnProfile) {
    return null // Dev notes are always private
  }

  if (isLoading) {
    return (
      <Window title="ملاحظاتي" path="~/dev-notes">
        <div className="text-text-secondary text-center py-8 font-mono">
          جاري التحميل...
        </div>
      </Window>
    )
  }

  return (
    <>
      <Window title="ملاحظاتي" path="~/dev-notes">
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الملاحظات..."
                className="w-full bg-gray border border-accent/30 px-10 py-2 rounded text-text font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <Button onClick={handleCreate} size="sm" variant="primary">
              <Plus className="w-4 h-4 ml-2" />
              ملاحظة جديدة
            </Button>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-text-secondary text-center py-12 font-mono">
              {searchQuery ? (
                <p>لا توجد نتائج للبحث</p>
              ) : (
                <>
                  <p className="mb-4">لا توجد ملاحظات بعد</p>
                  <Button onClick={handleCreate} variant="outline" size="sm">
                    أضف أول ملاحظة
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="border border-gray rounded-lg p-4 bg-bg hover:border-accent transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-mono text-accent font-bold">
                      {note.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1 hover:bg-gray rounded transition-colors"
                      >
                        <Edit className="w-4 h-4 text-accent" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1 hover:bg-gray rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="text-text-secondary text-sm mb-2 whitespace-pre-wrap line-clamp-3">
                    {note.content}
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray rounded text-xs text-accent font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-text-secondary font-mono mt-2">
                    {new Date(note.updated_at).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Window>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <DevNoteModal
          note={editingNote}
          onClose={() => {
            setIsModalOpen(false)
            setEditingNote(null)
          }}
          onSave={async (data) => {
            if (editingNote) {
              await updateMutation.mutateAsync({ id: editingNote.id, note: data })
            } else {
              await createMutation.mutateAsync(data as any)
            }
            setIsModalOpen(false)
            setEditingNote(null)
          }}
        />
      )}
    </>
  )
}

interface DevNoteModalProps {
  note: DevNoteType | null
  onClose: () => void
  onSave: (data: Partial<DevNoteType>) => void
}

function DevNoteModal({ note, onSave, onClose }: DevNoteModalProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [tags, setTags] = useState(note?.tags?.join(', ') || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    onSave({
      title,
      content,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : undefined,
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
            {note ? 'تعديل الملاحظة' : 'ملاحظة جديدة'}
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
            <div>
              <label className="block text-accent font-mono text-sm mb-2">
                المحتوى (Markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent min-h-[300px]"
                required
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
                placeholder="bug, solution, tip"
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

