'use client'

import { useState, useEffect } from 'react'
import { Window } from '../terminal/Window'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CodeEditor } from './CodeEditor'
import { ImageUploader } from './ImageUploader'
import { GistLinker } from './GistLinker'
import { playClickSound } from '@/lib/audio'
import { createPost } from '@/lib/api/posts'
import { useTags } from '@/hooks/useTags'
import { SUGGESTED_TAGS } from '@/lib/rants/tags'
import { useRouter } from 'next/navigation'
import { Code, Image, Github, FileText, Lock } from 'lucide-react'

const MAX_CONTENT_LENGTH = 5000

interface CreateRantModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateRantModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRantModalProps) {
  const [content, setContent] = useState('')
  const [codeContent, setCodeContent] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [images, setImages] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [moderationWarning, setModerationWarning] = useState<string | null>(
    null,
  )
  const [activeTab, setActiveTab] = useState<'text' | 'code' | 'image' | 'gist'>(
    'text',
  )

  const router = useRouter()

  // Suggestions = curated pain-points first, then any other popular tags.
  const { data: popularTags = [] } = useTags()
  const suggestedTags = Array.from(
    new Set([...SUGGESTED_TAGS, ...popularTags.map((t) => t.tag)]),
  ).slice(0, 10)

  // Extract hashtags from content
  useEffect(() => {
    const hashtags = content.match(/#[\w\u0600-\u06FF_]+/g)
    if (hashtags && hashtags.length > 0) {
      setSelectedTag(hashtags[0].substring(1))
    }
  }, [content])

  const handleGistLinked = (gistData: { url: string; content: string }) => {
    playClickSound()
    setContent((prev) => prev + '\n\n' + gistData.content)
    setActiveTab('text')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()

    if (moderationWarning) {
      return
    }

    // Combine free text with the optional code block and images (markdown).
    let finalContent = content.trim()
    if (codeContent.trim()) {
      finalContent += `\n\n\`\`\`${codeLanguage}\n${codeContent}\n\`\`\``
    }
    if (images.length > 0) {
      images.forEach((img) => {
        finalContent += `\n\n![Image](${img})`
      })
    }

    if (!finalContent) {
      setModerationWarning('لا يمكن نشر فضفضة فارغة.')
      return
    }
    if (finalContent.length > MAX_CONTENT_LENGTH) {
      setModerationWarning(`المحتوى يتجاوز الحد الأقصى (${MAX_CONTENT_LENGTH} حرف).`)
      return
    }

    setIsLoading(true)
    try {
      const tags = selectedTag ? [selectedTag] : []
      await createPost({
        content: finalContent,
        type: 'RANT',
        is_anonymous: isAnonymous,
        tags,
      })
      setContent('')
      setCodeContent('')
      setImages([])
      setSelectedTag('')
      setIsAnonymous(false)
      setModerationWarning(null)
      onSuccess()
      onClose()
    } catch (error: any) {
      const status = error?.response?.status
      if (status === 401) {
        router.push('/login?next=/rants')
      } else if (status === 429) {
        setModerationWarning('أنشأت منشورات كثيرة بسرعة. انتظر دقيقة وحاول مجدداً.')
      } else if (status === 400) {
        const detail = error?.response?.data?.content?.[0] || error?.response?.data?.detail
        setModerationWarning(detail || 'تحقّق من محتوى المنشور.')
      } else {
        setModerationWarning('تعذّر نشر الفضفضة. حاول مرة أخرى.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Window
        title="فضفض شوي"
        path="~/rants/create"
        onClose={onClose}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden" dir="rtl">
          {/* Warning Message */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-sm text-text mb-4 font-mono">
            <span>خلّينا نفضفض بدون ما نجرح بعض</span>
          </div>

          {/* Moderation Warning */}
          {moderationWarning && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-400 mb-4 font-mono">
              <p className="mb-2">{moderationWarning}</p>
              <p>بتحب تعيد صياغتها؟ خلّينا نخليها أخف.</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setModerationWarning(null)}
                className="mt-2"
              >
                موافق، سأعدل
              </Button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-dark">
            {[
              { id: 'text', label: 'نص', icon: FileText },
              { id: 'code', label: 'كود', icon: Code },
              { id: 'image', label: 'صورة', icon: Image },
              { id: 'gist', label: 'Gist', icon: Github },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playClickSound()
                    setActiveTab(tab.id as any)
                  }}
                  className={`px-4 py-2 font-mono text-sm transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-accent border-accent'
                      : 'text-text-secondary border-transparent hover:text-text hover:border-gray-dark'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            {activeTab === 'text' && (
              <div className="space-y-2">
                <label className="block text-text mb-2 font-mono text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  النص
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="احكي اللي بقلبك..."
                  className="w-full h-48 bg-gray-light border border-gray-dark rounded-lg p-4 text-text placeholder:text-text-secondary focus:outline-none focus:border-accent resize-none font-mono text-sm transition-all"
                  required
                  dir="rtl"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-secondary font-mono">
                    استخدم #hashtag لإضافة وسم
                  </p>
                  <p className="text-xs text-text-secondary font-mono">
                    {content.length} حرف
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-accent" />
                  <label className="text-text font-mono text-sm">الكود</label>
                </div>
                <CodeEditor
                  value={codeContent}
                  onChange={setCodeContent}
                  language={codeLanguage}
                  placeholder="اكتب الكود هنا..."
                />
                {codeContent && (
                  <p className="text-xs text-text-secondary font-mono text-right">
                    {codeContent.split('\n').length} سطر
                  </p>
                )}
              </div>
            )}

            {activeTab === 'image' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-accent" />
                  <label className="text-text font-mono text-sm">الصور</label>
                </div>
                <ImageUploader
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                />
                {images.length > 0 && (
                  <p className="text-xs text-text-secondary font-mono text-right">
                    {images.length} / 5 صور
                  </p>
                )}
              </div>
            )}

            {activeTab === 'gist' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Github className="w-4 h-4 text-accent" />
                  <label className="text-text font-mono text-sm">GitHub Gist</label>
                </div>
                <GistLinker onGistLinked={handleGistLinked} />
              </div>
            )}
          </div>

          {/* Tag Selection */}
          <div className="mb-4 flex-shrink-0">
            <label className="block text-text mb-2 font-mono text-sm">
              وين الوجع؟ (اختر وسماً أو اكتب وسمك)
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              {suggestedTags.map((tag) => {
                const isActive = selectedTag === tag
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      playClickSound()
                      setSelectedTag(isActive ? '' : tag)
                    }}
                    className={`rounded-lg px-3 py-1 font-mono text-sm transition-all ${
                      isActive
                        ? 'bg-accent text-bg'
                        : 'border border-gray-dark bg-gray-light text-text hover:border-accent'
                    }`}
                  >
                    #{tag}
                  </button>
                )
              })}
            </div>
            <Input
              type="text"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value.replace(/^#/, ''))}
              placeholder="أو اكتب وسماً جديداً"
              variant="terminal"
              className="w-full"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => {
                playClickSound()
                setIsAnonymous(e.target.checked)
              }}
              className="w-4 h-4 rounded border-gray-dark bg-gray-light text-accent focus:ring-accent cursor-pointer"
            />
            <label htmlFor="anonymous" className="text-text cursor-pointer font-mono text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-text-secondary" />
              نشر مجهول
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-dark flex-shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="border border-gray-dark font-mono"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || (!content.trim() && !codeContent.trim())}
              className="bg-accent text-bg hover:bg-accent/90 font-mono"
            >
              {isLoading ? 'جاري النشر...' : 'نشر'}
            </Button>
          </div>
        </form>
      </Window>
    </div>
  )
}
