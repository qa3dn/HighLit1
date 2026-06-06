'use client'

import { useEffect, useRef, useState } from 'react'
import { Share2, Copy, Check, Send, ExternalLink } from 'lucide-react'

interface ShareMenuProps {
  /** Absolute URL to share. */
  url: string
  /** Text used as the share title / tweet body. */
  title: string
}

export function ShareMenu({ url, title }: ShareMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (insecure context) — leave the menu open so the
      // user can still use a share-target link below.
      setCopied(false)
    }
  }

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url })
      setOpen(false)
    } catch (err) {
      // AbortError = the user dismissed the share sheet (benign). Any other
      // rejection (permissions block, bad data) is a real failure, so fall
      // back to copying the link rather than leaving the user with nothing.
      if (err instanceof DOMException && err.name === 'AbortError') return
      void copyLink()
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`

  const itemClass =
    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-text transition-colors hover:bg-bg'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-gray-light hover:text-text"
      >
        <Share2 className="h-4 w-4" aria-hidden /> <span>مشاركة</span>
      </button>

      {open && (
        <div
          role="menu"
          dir="rtl"
          className="absolute bottom-full z-30 mb-1 w-52 overflow-hidden rounded-xl border border-gray-dark bg-gray-light p-1 shadow-large"
        >
          <button type="button" role="menuitem" onClick={copyLink} className={itemClass}>
            {copied ? <Check className="h-4 w-4 text-accent" aria-hidden /> : <Copy className="h-4 w-4 text-text-secondary" aria-hidden />}
            {copied ? 'تم نسخ الرابط' : 'نسخ الرابط'}
          </button>
          {canNativeShare && (
            <button type="button" role="menuitem" onClick={nativeShare} className={itemClass}>
              <Send className="h-4 w-4 text-text-secondary" aria-hidden /> مشاركة عبر التطبيقات
            </button>
          )}
          <a role="menuitem" href={tweetUrl} target="_blank" rel="noopener noreferrer" className={itemClass} onClick={() => setOpen(false)}>
            <ExternalLink className="h-4 w-4 text-text-secondary" aria-hidden /> مشاركة على X
          </a>
          <a role="menuitem" href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={itemClass} onClick={() => setOpen(false)}>
            <ExternalLink className="h-4 w-4 text-text-secondary" aria-hidden /> واتساب
          </a>
        </div>
      )}
    </div>
  )
}
