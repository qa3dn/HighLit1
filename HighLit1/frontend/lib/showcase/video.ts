export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      let videoId = parsed.searchParams.get('v')
      if (!videoId && parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1)
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      if (id) return `https://player.vimeo.com/video/${id}`
    }

    if (parsed.hostname.includes('drive.google.com')) {
      const fileId = parsed.searchParams.get('id') || parsed.pathname.match(/\/d\/([^/]+)/)?.[1]
      if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`
    }
  } catch {
    return null
  }

  return null
}
