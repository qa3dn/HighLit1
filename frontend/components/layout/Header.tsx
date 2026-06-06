'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

const NAV_LINKS = [
  { href: '/rants', label: 'فش غلك', isActive: (p: string) => p === '/rants' },
  { href: '/code', label: 'فرجينا شغلك', isActive: (p: string) => p.startsWith('/code') },
  { href: '/jobs', label: 'وين في شغل؟', isActive: (p: string) => p.startsWith('/jobs') },
] as const

function navLinkClass(active: boolean, mobile = false) {
  const base = mobile
    ? 'flex items-center rounded-xl px-4 py-3.5 text-base font-medium transition-colors'
    : 'rounded-lg px-3 py-2 text-sm font-medium transition-colors'

  return active
    ? `${base} bg-accent/10 text-accent ring-1 ring-accent/25`
    : `${base} text-text-secondary hover:bg-white/5 hover:text-text`
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return null

        const { data } = await api.get('/auth/me')
        return data
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401) {
          localStorage.removeItem('token')
          return null
        }
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: typeof window !== 'undefined',
  })

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleLogout = () => {
    playClickSound()
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    router.push('/')
    window.location.reload()
  }

  const closeMenu = () => setMenuOpen(false)

  const profileShortcut = currentUser ? (
    <Link
      href="/profile/me"
      onClick={() => {
        playClickSound()
        closeMenu()
      }}
      className="group flex items-center gap-2 rounded-full border border-gray-dark bg-gray-light py-1 pe-3 ps-1 transition-colors hover:border-accent/40"
      aria-label="ملفي الشخصي"
    >
      {currentUser.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUser.avatar_url}
          alt={currentUser.username}
          className="h-7 w-7 rounded-full border border-gray-dark object-cover"
        />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-xs font-bold text-accent">
          {(currentUser.username?.[0] ?? '?').toUpperCase()}
        </span>
      )}
      <span className="truncate text-sm font-medium text-text transition-colors group-hover:text-accent">
        {currentUser.username}
      </span>
    </Link>
  ) : null

  const authBlock = currentUser ? (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
      {profileShortcut}
      <Button
        onClick={() => {
          closeMenu()
          handleLogout()
        }}
        variant="secondary"
        size="sm"
        className="w-full sm:w-auto border border-gray-dark bg-gray-light text-text hover:border-accent/40 hover:bg-gray"
      >
        خروج
      </Button>
    </div>
  ) : (
    <Button
      asChild
      variant="primary"
      size="sm"
      className="w-full sm:w-auto bg-accent text-bg hover:bg-accent-hover"
    >
      <Link
        href="/login"
        onClick={() => {
          playClickSound()
          closeMenu()
        }}
      >
        سجل دخول
      </Link>
    </Button>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={playClickSound}
          className="flex shrink-0 items-center transition-opacity hover:opacity-80"
          aria-label="HighLit — الصفحة الرئيسية"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/highlit-logo.png" alt="HighLit" className="h-11 w-auto sm:h-12" />
        </Link>

        <nav
          className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:gap-0.5"
          aria-label="التنقل الرئيسي"
        >
          {NAV_LINKS.map((link) => {
            const active = link.isActive(pathname ?? '')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={playClickSound}
                className={navLinkClass(active)}
              >
                {link.label}
              </Link>
            )
          })}
          {currentUser && (
            <Link
              href="/profile/me"
              onClick={playClickSound}
              className={navLinkClass((pathname ?? '').startsWith('/profile'))}
            >
              غرفتي
            </Link>
          )}
          {currentUser && (
            <Link
              href="/company"
              onClick={playClickSound}
              className={navLinkClass((pathname ?? '').startsWith('/company'))}
            >
              شركتي
            </Link>
          )}
        </nav>

        <div className="hidden shrink-0 lg:flex lg:items-center lg:gap-3">
          {authBlock}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {!currentUser && (
            <Link
              href="/login"
              onClick={playClickSound}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-bg sm:text-sm"
            >
              دخول
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              playClickSound()
              setMenuOpen((open) => !open)
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-text transition hover:border-accent/30 hover:bg-white/10"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`lg:hidden ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={`fixed inset-0 top-14 z-40 bg-black/60 backdrop-blur-sm transition-opacity sm:top-16 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
          aria-label="إغلاق القائمة"
          tabIndex={menuOpen ? 0 : -1}
        />
        <div
          className={`fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-white/10 bg-bg/95 px-4 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out sm:top-16 sm:max-h-[calc(100dvh-4rem)] ${
            menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-1" aria-label="التنقل للجوال">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  playClickSound()
                  closeMenu()
                }}
                className={navLinkClass(link.isActive(pathname ?? ''), true)}
              >
                {link.label}
              </Link>
            ))}
            {currentUser && (
              <Link
                href="/profile/me"
                onClick={() => {
                  playClickSound()
                  closeMenu()
                }}
                className={navLinkClass((pathname ?? '').startsWith('/profile'), true)}
              >
                غرفتي
              </Link>
            )}
            {currentUser && (
              <Link
                href="/company"
                onClick={() => {
                  playClickSound()
                  closeMenu()
                }}
                className={navLinkClass((pathname ?? '').startsWith('/company'), true)}
              >
                شركتي
              </Link>
            )}
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">{authBlock}</div>
        </div>
      </div>
    </header>
  )
}