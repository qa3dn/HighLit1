'use client'

import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '@/lib/api'

interface RoastSectionProps {
  postId: string
  isRoastEnabled: boolean
}

export function RoastSection({ postId, isRoastEnabled }: RoastSectionProps) {
  const [roast, setRoast] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roast.trim()) return

    setIsLoading(true)
    try {
      // This would be a comment with special roast flag
      await api.post(`/posts/${postId}/comments`, {
        content: roast,
        is_roast: true,
      })
      setRoast('')
      alert('تم إرسال النقد!')
    } catch (error) {
      console.error('Failed to submit roast:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isRoastEnabled) return null

  return (
    <Card className="mt-4 border-orange-600">
      <h3 className="text-lg font-semibold mb-2 text-orange-400">🔥 Roast My Code</h3>
      <p className="text-gray-400 text-sm mb-4">
        الكود مفتوح للنقد البناء - لا تتردد في إبداء رأيك الصريح!
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={roast}
          onChange={(e) => setRoast(e.target.value)}
          placeholder="اكتب نقدك البناء هنا..."
          className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white mb-4"
        />
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'جاري الإرسال...' : 'أرسل النقد'}
        </Button>
      </form>
    </Card>
  )
}

