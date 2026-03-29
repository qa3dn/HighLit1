'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/hooks/useAuth'

export default function AdminProfilePage() {
  const params = useParams()
  const router = useRouter()
  const adminId = params.id as string
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()

  // Determine the actual admin ID to fetch
  const finalAdminId = (adminId === 'me' || adminId === 'undefined')
    ? currentUser?.id
    : adminId

  const isOwnProfile = currentUser?.id === finalAdminId || adminId === 'me'

  // Redirect if not admin
  useEffect(() => {
    if (isMounted && currentUser && isOwnProfile && currentUser.role !== 'ADMIN') {
      router.push('/profile/me')
    }
  }, [isMounted, currentUser, isOwnProfile, router])

  const { data: admin, isLoading: isLoadingProfile, error: userError } = useQuery({
    queryKey: ['admin', finalAdminId],
    queryFn: async () => {
      if (!finalAdminId) {
        throw new Error('Admin ID is required')
      }
      const { data } = await api.get(`/users/${finalAdminId}`)
      return data
    },
    enabled: isMounted && !!finalAdminId && (adminId !== 'me' || !!currentUser),
    retry: false,
  })

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent" suppressHydrationWarning>Loading admin profile...</div>
      </div>
    )
  }

  if (adminId === 'me') {
    if (isLoadingUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Loading admin profile...</div>
        </div>
      )
    }

    if (!currentUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Please log in to view your admin profile</div>
        </div>
      )
    }

    if (currentUser.role !== 'ADMIN') {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Admin access required</div>
        </div>
      )
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Loading admin profile...</div>
      </div>
    )
  }

  if (userError || !admin) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Admin not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text relative">
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Admin Header */}
          <div className="bg-gray-dark border border-gray rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text mb-2">
                  {admin.username}
                  <span className="ml-2 text-sm text-accent bg-accent/20 px-2 py-1 rounded">
                    ADMIN
                  </span>
                </h1>
                <p className="text-text-secondary">{admin.email}</p>
              </div>
              {admin.avatar_url && (
                <img
                  src={admin.avatar_url}
                  alt={admin.username}
                  className="w-20 h-20 rounded-full border-2 border-accent"
                />
              )}
            </div>
          </div>

          {/* Admin Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-dark border border-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-text-secondary text-sm">Manage users, roles, and permissions</p>
            </div>
            <div className="bg-gray-dark border border-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Content Moderation</h3>
              <p className="text-text-secondary text-sm">Review and moderate posts and comments</p>
            </div>
            <div className="bg-gray-dark border border-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">System Settings</h3>
              <p className="text-text-secondary text-sm">Configure system-wide settings</p>
            </div>
            <div className="bg-gray-dark border border-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-text-secondary text-sm">View platform statistics and reports</p>
            </div>
            <div className="bg-gray-dark border border-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Reports</h3>
              <p className="text-text-secondary text-sm">Handle user reports and complaints</p>
            </div>
            <div className="bg-gray-dark border border-gray rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Database</h3>
              <p className="text-text-secondary text-sm">Manage database and migrations</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

