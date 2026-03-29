'use client'

import Link from 'next/link'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  // Get current user info - use same query key as useCurrentUser hook
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return null
        
        const { data } = await api.get('/auth/me')
        return data
      } catch (error: any) {
        // If 401, user is not authenticated
        if (error?.response?.status === 401) {
          localStorage.removeItem('token')
          return null
        }
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: typeof window !== 'undefined', // Only run on client
  })

  const handleLogout = () => {
    playClickSound()
    localStorage.removeItem('token')
    router.push('/')
    // Refresh the page to update the header
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 bg-bg border-b border-gray-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Left Section - Logo/Title */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              onClick={playClickSound}
              className="text-text text-lg font-bold hover:text-accent transition-colors"
              dir="ltr"
            >
              HighLit
            </Link>
            <span className="text-text font-mono text-lg font-bold" dir="ltr">&gt;_</span>
          </div>

          {/* Middle Section - Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/rants"
              onClick={playClickSound}
              className={`${
                pathname === '/rants'
                  ? 'text-text border-b-2 border-text'
                  : 'text-text-secondary hover:text-text'
              } transition-all pb-1 text-sm font-medium`}
            >
              فش غلك
            </Link>
            <Link
              href="/code"
              onClick={playClickSound}
              className={`${
                pathname?.startsWith('/code')
                  ? 'text-text border-b-2 border-text'
                  : 'text-text-secondary hover:text-text'
              } transition-all pb-1 text-sm font-medium`}
            >
              فرجينا شغلك
            </Link>
            <Link
              href="/spaces"
              onClick={playClickSound}
              className={`${
                pathname?.startsWith('/spaces')
                  ? 'text-text border-b-2 border-text'
                  : 'text-text-secondary hover:text-text'
              } transition-all pb-1 text-sm font-medium`}
            >
              قعدة مبرمجين
            </Link>
            <Link
              href="/jobs"
              onClick={playClickSound}
              className={`${
                pathname?.startsWith('/jobs')
                  ? 'text-text border-b-2 border-text'
                  : 'text-text-secondary hover:text-text'
              } transition-all pb-1 text-sm font-medium`}
            >
              وين في شغل؟
            </Link>
            {currentUser && (
              <Link
                href={`/profile/me`}
                onClick={playClickSound}
                className={`${
                  pathname?.startsWith('/profile')
                    ? 'text-text border-b-2 border-text'
                    : 'text-text-secondary hover:text-text'
                } transition-all pb-1 text-sm font-medium`}
              >
                غرفتي
              </Link>
            )}
          </nav>

          {/* Right Section - User/Login */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/me`}
                  onClick={playClickSound}
                  className="text-text hover:text-accent transition-colors font-medium text-sm"
                >
                  {currentUser.username}
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="bg-gray-light text-text hover:bg-gray border border-gray-dark"
                >
                  خروج
                </Button>
              </div>
            ) : (
              <Button
                asChild
                variant="primary"
                size="sm"
                className="bg-text text-bg hover:bg-text/90 border-0"
              >
                <Link href="/login">سجل دخول نشوفك</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
