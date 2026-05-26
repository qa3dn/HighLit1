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
  const [isEditMode, setIsEditMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Only run on client to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  
  // Determine the actual user ID to fetch
  const targetUserId = (userId === 'me' || userId === 'undefined') 
    ? currentUser?.id 
    : userId
  
  // Get final target user ID - handle case where targetUserId might be undefined but currentUser.id exists
  const finalTargetUserId = (userId === 'me' || userId === 'undefined') 
    ? (currentUser?.id || currentUser?.['id'] || targetUserId)
    : targetUserId
  
  const isOwnProfile = currentUser?.id === finalTargetUserId || userId === 'me'

  const { data: user, isLoading: isLoadingProfile, error: userError } = useQuery({
    queryKey: ['user', finalTargetUserId],
    queryFn: async () => {
      if (!finalTargetUserId) {
        throw new Error('User ID is required')
      }
      const { data } = await api.get(`/users/${finalTargetUserId}`)
      return data
    },
    enabled: isMounted && !!finalTargetUserId && (userId !== 'me' || !!currentUser),
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
    finalTargetUserId || '',
    isOwnProfile
  )

  // Show loading on initial mount to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent" suppressHydrationWarning>Loading user profile...</div>
      </div>
    )
  }

  // If userId is 'me', we need to wait for currentUser
  if (userId === 'me') {
    if (isLoadingUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Loading user profile...</div>
        </div>
      )
    }
    
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Please log in to view your profile</div>
        </div>
      )
    }
    
    // Now we have currentUser, check that it has an ID
    if (!currentUser?.id) {
      console.error('Error: currentUser exists but no ID:', {
        currentUser,
        keys: currentUser ? Object.keys(currentUser) : [],
      })
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">
            Error: Unable to determine user ID. Please try refreshing the page.
            <br />
            <span className="text-text-secondary text-xs mt-2 block">
              If the problem persists, please log out and log in again.
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
          <div className="font-mono text-accent">Invalid user ID</div>
        </div>
      )
    }
  }
  
  // Final check - make sure we have a valid user ID
  if (!finalTargetUserId || finalTargetUserId === 'undefined') {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Invalid user ID</div>
      </div>
    )
  }

  // Show loading while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Loading user profile...</div>
      </div>
    )
  }

  // Show error if user fetch failed
  if (userError) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Error loading user profile</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">User not found</div>
      </div>
    )
  }

  // Redirect if user is ADMIN or COMPANY (only show USER profiles here)
  if (isOwnProfile && (user.role === 'ADMIN' || user.role === 'COMPANY')) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Redirecting...</div>
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
          onEditClick={() => setIsEditMode(!isEditMode)}
        />

        {/* Main Layout: 3 Columns */}
        <div className="flex h-[calc(100vh-200px)]">
          {/* Left: Navigation */}
          <RoomNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            isOwnProfile={isOwnProfile}
          />

          {/* Center: Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderSection()}
          </div>

          {/* Right: Quick Controls */}
          {isOwnProfile && <QuickControls isOwnProfile={isOwnProfile} />}
        </div>
      </main>
      <Footer />
    </div>
  )
}
