'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { api } from '@/lib/api'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.post('/posts', {
        content,
        type: 'RANT',
        is_anonymous: isAnonymous,
      })
      setContent('')
      setIsAnonymous(false)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl border border-gray-800">
        <h2 className="text-2xl font-bold mb-4">إنشاء منشور جديد</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="شو فيك؟ فضفض..."
            className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white mb-4"
            required
          />
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4"
              />
              <span>نشر مجهول</span>
            </label>
          </div>
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'جاري النشر...' : 'نشر'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

