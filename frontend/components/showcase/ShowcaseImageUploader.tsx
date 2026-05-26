'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadProjectImage } from '@/lib/api/studentProjects'
import { playClickSound } from '@/lib/audio'

interface ShowcaseImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ShowcaseImageUploader({
  images,
  onImagesChange,
  maxImages = 6,
}: ShowcaseImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      playClickSound()
      setError(null)
      const remaining = maxImages - images.length
      const files = acceptedFiles.slice(0, remaining)
      if (!files.length) return

      setUploading(true)
      try {
        const urls: string[] = []
        for (const file of files) {
          const result = await uploadProjectImage(file)
          urls.push(result.url)
        }
        onImagesChange([...images, ...urls])
      } catch {
        setError('فشل رفع الصورة. تأكد من الحجم (أقل من 5MB) والصيغة المدعومة.')
      } finally {
        setUploading(false)
      }
    },
    [images, maxImages, onImagesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: maxImages - images.length,
    disabled: uploading || images.length >= maxImages,
  })

  const removeImage = (index: number) => {
    playClickSound()
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4" dir="rtl">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, i) => (
            <div key={src} className="relative aspect-video overflow-hidden rounded-lg border border-gray-dark">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute left-2 top-2 rounded-full bg-bg/80 p-1 text-text hover:bg-red-500/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
            isDragActive
              ? 'border-accent bg-accent/10'
              : 'border-gray-dark bg-gray-light hover:border-accent/50'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
          ) : (
            <Upload className="mx-auto mb-2 h-8 w-8 text-text-secondary" />
          )}
          <p className="text-sm text-text">
            {isDragActive ? 'اسقط الصور هنا' : 'اسحب الصور أو اضغط للرفع'}
          </p>
          <p className="mt-1 text-xs text-text-secondary">PNG, JPG, WebP — حتى {maxImages} صور</p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
