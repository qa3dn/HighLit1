'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

interface ImageGalleryProps {
  images: string[]
  title?: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (!images?.length) return null

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => {
              playClickSound()
              setLightbox(src)
            }}
            className="group overflow-hidden rounded-xl border border-gray-dark focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <img
              src={src}
              alt={`${title || 'مشروع'} - ${i + 1}`}
              className="aspect-video w-full object-cover transition group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            className="absolute left-4 top-4 rounded-full border border-white/20 p-2 text-white"
            onClick={() => setLightbox(null)}
            aria-label="إغلاق"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox}
            alt={title || 'معاينة'}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
