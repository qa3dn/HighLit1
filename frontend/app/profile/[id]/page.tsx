'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { IdentityHeader } from '@/components/room/IdentityHeader'
import { RoomNavigation, RoomSection } from '@/components/room/RoomNavigation'
import { CodeProjects } from '@/components/profile/CodeProjects'
import { DevNotes } from '@/components/room/DevNotes'
import { Ideas } from '@/components/room/Ideas'
import { MyRants } from '@/components/room/MyRants'
import { SavedItems } from '@/components/room/SavedItems'
import { QuickControls } from '@/components/room/QuickControls'
import { ProfileSettings } from '@/components/profile/ProfileSettings'
import { PublicProfile } from '@/components/profile/PublicProfile'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/hooks/useAuth'
import { useRoomData } from '@/hooks/useRoom'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [activeSection, setActiveSection] = useState<RoomSection>('code')
  const [isMounted, setIsMounted] = useState(false)

  // Only run on client to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  
  // The user id to fetch: the signed-in user for "me", otherwise the route param.
  const targetUserId = userId === 'me' || userId === 'undefined' ? currentUser?.id : userId

  const isOwnProfile = currentUser?.id === targetUserId || userId === 'me'

  const { data: user, isLoading: isLoadingProfile, error: userError } = useQuery({
    queryKey: ['user', targetUserId],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('User ID is required')
      }
      const { data } = await api.get(`/users/${targetUserId}`)
      return data
    },
    enabled: isMounted && !!targetUserId && (userId !== 'me' || !!currentUser),
    retry: false,
  })

  // Redirect based on role
  useEffect(() => {
    if (isMounted && user && isOwnProfile) {
      if (user.role === 'ADMIN') {
        router.replace(`/profile/admin/${userId === 'me' ? 'me' : user.id}`)
      } else if (user.role === 'COMPANY') {
        router.replace('/company')
      }
    }
  }, [isMounted, user, isOwnProfile, userId, router])

  const { data: roomData } = useRoomData(
    targetUserId || '',
    isOwnProfile
  )

  // Show loading on initial mount to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent" suppressHydrationWarning>جارٍ تحميل الملف الشخصي...</div>
      </div>
    )
  }

  // If userId is 'me', we need to wait for currentUser
  if (userId === 'me') {
    if (isLoadingUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">جارٍ تحميل الملف الشخصي...</div>
        </div>
      )
    }
    
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">سجّل الدخول لعرض ملفك الشخصي</div>
        </div>
      )
    }
    
    // Now we have currentUser, check that it has an ID
    if (!currentUser?.id) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">
            تعذّر تحديد معرّف المستخدم. حاول تحديث الصفحة.
            <br />
            <span className="text-text-secondary text-xs mt-2 block">
              إذا استمرّت المشكلة، سجّل الخروج ثم الدخول من جديد.
            </span>
          </div>
        </div>
      )
    }
  } else {
    // For specific user IDs, check if valid
    if (!targetUserId || targetUserId === 'undefined') {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">معرّف مستخدم غير صالح</div>
        </div>
      )
    }
  }
  
  // Final check - make sure we have a valid user ID
  if (!targetUserId || targetUserId === 'undefined') {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">معرّف مستخدم غير صالح</div>
      </div>
    )
  }

  // Show loading while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">جارٍ تحميل الملف الشخصي...</div>
      </div>
    )
  }

  // Show error if user fetch failed
  if (userError) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">تعذّر تحميل الملف الشخصي</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">المستخدم غير موجود</div>
      </div>
    )
  }

  // Redirect if user is ADMIN or COMPANY (only show USER profiles here)
  if (isOwnProfile && (user.role === 'ADMIN' || user.role === 'COMPANY')) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">جارٍ التحويل...</div>
      </div>
    )
  }

  const codeCount = roomData?.code_storage?.length || 0

  const renderSection = () => {
    switch (activeSection) {
      case 'code':
        return <CodeProjects isOwnProfile={isOwnProfile} />
      case 'notes':
        return <DevNotes isOwnProfile={isOwnProfile} />
      case 'ideas':
        return <Ideas userId={user.id} isOwnProfile={isOwnProfile} />
      case 'rants':
        return <MyRants userId={user.id} isOwnProfile={isOwnProfile} />
      case 'saved':
        return <SavedItems isOwnProfile={isOwnProfile} />
      case 'settings':
        return <ProfileSettings />
      default:
        return <CodeProjects isOwnProfile={isOwnProfile} />
    }
  }

  // Viewing someone else's profile → the public, social identity page.
  if (!isOwnProfile) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Header />
        <main className="relative z-10">
          <PublicProfile userId={user.id} />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text relative">
      <Header />
      <main className="relative z-10">
        {/* Identity Header */}
        <IdentityHeader
          user={user}
          codeCount={codeCount}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setActiveSection('settings')}
        />

        {/* Main Layout: responsive (stacked on mobile, 3 columns on desktop) */}
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 lg:flex-row lg:items-start">
          {/* Left: Navigation */}
          <RoomNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isOwnProfile={isOwnProfile}
          />

          {/* Center: Main Content */}
          <div className="min-w-0 flex-1">{renderSection()}</div>

          {/* Right: Quick Controls */}
          {isOwnProfile && <QuickControls isOwnProfile={isOwnProfile} />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
