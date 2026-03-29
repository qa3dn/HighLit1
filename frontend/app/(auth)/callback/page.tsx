'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      localStorage.setItem('token', token)
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['current-user'] }).then(() => {
        // Wait a bit for the query to refetch
        setTimeout(() => {
          router.push('/rants')
        }, 100)
      })
    } else {
      router.push('/login')
    }
  }, [searchParams, router, queryClient])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
        <p>جاري تسجيل الدخول...</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}

