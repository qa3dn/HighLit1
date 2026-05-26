'use client'

import { getVideoEmbedUrl } from '@/lib/showcase/video'

interface VideoEmbedProps {
  url: string
  title?: string
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const embedUrl = getVideoEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="rounded-xl border border-gray-dark bg-gray-light p-6 text-center" dir="rtl">
        <p className="text-text-secondary">رابط الفيديو غير مدعوم للعرض المضمّن.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-accent hover:underline"
        >
          فتح الرابط
        </a>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-dark bg-black">
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title || 'فيديو المشروع'}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
