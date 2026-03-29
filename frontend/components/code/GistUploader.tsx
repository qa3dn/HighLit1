'use client'

import { useState } from 'react'
import { Button } from '../ui/Button'
import { api } from '@/lib/api'

interface GistUploaderProps {
  onGistLoaded: (gistUrl: string) => void
}

export function GistUploader({ onGistLoaded }: GistUploaderProps) {
  const [gistUrl, setGistUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gistUrl.trim()) return

    setIsLoading(true)
    try {
      // Validate Gist URL
      const gistId = gistUrl.match(/gist\.github\.com\/[\w-]+\/([\w]+)/)?.[1]
      if (!gistId) {
        alert('رابط Gist غير صحيح')
        return
      }

      onGistLoaded(gistUrl)
      setGistUrl('')
    } catch (error) {
      console.error('Failed to load Gist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={gistUrl}
          onChange={(e) => setGistUrl(e.target.value)}
          placeholder="رابط GitHub Gist"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        />
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'جاري التحميل...' : 'تحميل'}
        </Button>
      </div>
    </form>
  )
}

