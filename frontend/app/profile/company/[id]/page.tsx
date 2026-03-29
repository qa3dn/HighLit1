'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/hooks/useAuth'

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser()

  // Determine the actual company ID to fetch
  const finalCompanyId = (companyId === 'me' || companyId === 'undefined')
    ? currentUser?.id
    : companyId

  const isOwnProfile = currentUser?.id === finalCompanyId || companyId === 'me'

  // Redirect if not company
  useEffect(() => {
    if (isMounted && currentUser && isOwnProfile && currentUser.role !== 'COMPANY') {
      router.push('/profile/me')
    }
  }, [isMounted, currentUser, isOwnProfile, router])

  const { data: company, isLoading: isLoadingProfile, error: userError } = useQuery({
    queryKey: ['company', finalCompanyId],
    queryFn: async () => {
      if (!finalCompanyId) {
        throw new Error('Company ID is required')
      }
      const { data } = await api.get(`/users/${finalCompanyId}`)
      return data
    },
    enabled: isMounted && !!finalCompanyId && (companyId !== 'me' || !!currentUser),
    retry: false,
  })

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent" suppressHydrationWarning>Loading company profile...</div>
      </div>
    )
  }

  if (companyId === 'me') {
    if (isLoadingUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Loading company profile...</div>
        </div>
      )
    }

    if (!currentUser) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Please log in to view your company profile</div>
        </div>
      )
    }

    if (currentUser.role !== 'COMPANY') {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="font-mono text-accent">Company access required</div>
        </div>
      )
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Loading company profile...</div>
      </div>
    )
  }

  if (userError || !company) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="font-mono text-accent">Company not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text relative">
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Company Header */}
          <div className="bg-gray-dark border border-gray rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text mb-2">
                  {company.username}
                  <span className="ml-2 text-sm text-accent bg-accent/20 px-2 py-1 rounded">
                    COMPANY
                  </span>
                </h1>
                <p className="text-text-secondary">{company.email}</p>
                {company.bio && (
                  <p className="text-text-secondary mt-2">{company.bio}</p>
                )}
              </div>
              {company.avatar_url && (
                <img
                  src={company.avatar_url}
                  alt={company.username}
                  className="w-20 h-20 rounded-full border-2 border-accent"
                />
              )}
            </div>
          </div>

          {/* Company Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Posted Jobs */}
            <div className="bg-gray-dark border border-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Posted Jobs</h2>
              <p className="text-text-secondary text-sm">
                Manage your job postings and applications
              </p>
              <button className="mt-4 px-4 py-2 bg-accent text-bg rounded hover:bg-accent/90 transition-colors">
                View Jobs
              </button>
            </div>

            {/* Company Info */}
            <div className="bg-gray-dark border border-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Company Information</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-text-secondary">Email:</span>
                  <span className="ml-2 text-text">{company.email}</span>
                </div>
                {company.bio && (
                  <div>
                    <span className="text-text-secondary">About:</span>
                    <p className="mt-1 text-text">{company.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Applications */}
            <div className="bg-gray-dark border border-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Applications</h2>
              <p className="text-text-secondary text-sm">
                Review job applications from candidates
              </p>
              <button className="mt-4 px-4 py-2 bg-accent text-bg rounded hover:bg-accent/90 transition-colors">
                View Applications
              </button>
            </div>

            {/* Company Reviews */}
            <div className="bg-gray-dark border border-gray rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Company Reviews</h2>
              <p className="text-text-secondary text-sm">
                See what employees say about your company
              </p>
              <button className="mt-4 px-4 py-2 bg-accent text-bg rounded hover:bg-accent/90 transition-colors">
                View Reviews
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

