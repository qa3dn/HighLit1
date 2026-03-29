'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Lightbulb, Zap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Window } from '@/components/terminal/Window'
import { playClickSound, playWindowOpenSound } from '@/lib/audio'
import {
  useIdeas,
  useCreateIdea,
  useUpdateIdea,
  useDeleteIdea,
  Idea as IdeaType,
} from '@/hooks/useRoom'

interface IdeasProps {
  userId: string
  isOwnProfile: boolean
}

const statusConfig = {
  IDEA: { label: 'فكرة', icon: Lightbulb, color: 'text-yellow-500' },
  WORKING: { label: 'شغالة', icon: Zap, color: 'text-green-500' },
  CRAZY: { label: 'مجنونة', icon: Sparkles, color: 'text-purple-500' },
}

export function Ideas({ userId, isOwnProfile }: IdeasProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<IdeaType | null>(null)

  const { data: ideas = [], isLoading } = useIdeas(userId)
  const createMutation = useCreateIdea()
  const updateMutation = useUpdateIdea()
  const deleteMutation = useDeleteIdea()

  const handleCreate = () => {
    playWindowOpenSound()
    setEditingIdea(null)
    setIsModalOpen(true)
  }

  const handleEdit = (idea: IdeaType) => {
    if (!isOwnProfile) return
    playWindowOpenSound()
    setEditingIdea(idea)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفكرة؟')) {
      playClickSound()
      await deleteMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <Window title="أفكاري" path="~/ideas">
        <div className="text-text-secondary text-center py-8 font-mono">
          جاري التحميل...
        </div>
      </Window>
    )
  }

  return (
    <>
      <Window title="أفكاري" path="~/ideas">
        <div className="space-y-4">
          {isOwnProfile && (
            <div className="flex justify-end mb-4">
              <Button onClick={handleCreate} size="sm" variant="primary">
                <Plus className="w-4 h-4 ml-2" />
                فكرة جديدة
              </Button>
            </div>
          )}

          {ideas.length === 0 ? (
            <div className="text-text-secondary text-center py-12 font-mono">
              <p className="mb-4">لا توجد أفكار بعد</p>
              {isOwnProfile && (
                <Button onClick={handleCreate} variant="outline" size="sm">
                  أضف أول فكرة
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ideas.map((idea) => {
                const status = statusConfig[idea.status]
                const StatusIcon = status.icon
                return (
                  <div
                    key={idea.id}
                    className="border border-gray rounded-lg p-4 bg-bg hover:border-accent transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-mono text-accent font-bold mb-2">
                          {idea.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <span className={`text-xs font-mono ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(idea)}
                            className="p-1 hover:bg-gray rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-accent" />
                          </button>
                          <button
                            onClick={() => handleDelete(idea.id)}
                            className="p-1 hover:bg-gray rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                    {idea.description && (
                      <p className="text-sm text-text-secondary mb-2 line-clamp-3">
                        {idea.description}
                      </p>
                    )}
                    <div className="text-xs text-text-secondary font-mono">
                      {new Date(idea.updated_at).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Window>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <IdeaModal
          idea={editingIdea}
          onClose={() => {
            setIsModalOpen(false)
            setEditingIdea(null)
          }}
          onSave={async (data) => {
            if (editingIdea) {
              await updateMutation.mutateAsync({ id: editingIdea.id, idea: data })
            } else {
              await createMutation.mutateAsync(data as any)
            }
            setIsModalOpen(false)
            setEditingIdea(null)
          }}
        />
      )}
    </>
  )
}

interface IdeaModalProps {
  idea: IdeaType | null
  onClose: () => void
  onSave: (data: Partial<IdeaType>) => void
}

function IdeaModal({ idea, onSave, onClose }: IdeaModalProps) {
  const [title, setTitle] = useState(idea?.title || '')
  const [description, setDescription] = useState(idea?.description || '')
  const [status, setStatus] = useState<'IDEA' | 'WORKING' | 'CRAZY'>(
    idea?.status || 'IDEA'
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    onSave({
      title,
      description: description || undefined,
      status,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg border border-accent rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-mono text-accent font-bold mb-6">
            {idea ? 'تعديل الفكرة' : 'فكرة جديدة'}
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
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-accent font-mono text-sm mb-2">
                الحالة
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'IDEA' | 'WORKING' | 'CRAZY')}
                className="w-full bg-gray border border-accent/30 px-3 py-2 rounded text-text font-mono focus:outline-none focus:border-accent"
              >
                <option value="IDEA">فكرة</option>
                <option value="WORKING">شغالة</option>
                <option value="CRAZY">مجنونة</option>
              </select>
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

