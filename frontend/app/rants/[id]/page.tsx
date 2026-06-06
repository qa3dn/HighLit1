'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RantCard } from '@/components/rants/RantCard'
import { RantCardSkeleton } from '@/components/rants/RantCardSkeleton'
import { usePost } from '@/hooks/usePosts'
import { useCurrentUser } from '@/hooks/useAuth'

export default function RantDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: post, isLoading, isError } = usePost(id)
  const { data: currentUser } = useCurrentUser()
  const isAuthenticated = !!currentUser

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8" dir="rtl">
        <Link
          href="/rants"
          className="mb-4 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          <ChevronRight className="h-4 w-4" aria-hidden /> العودة للفضفضات
        </Link>

        {isLoading ? (
          <RantCardSkeleton />
        ) : isError || !post ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-dark bg-gray-light py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-text-secondary/50" aria-hidden />
            <p className="text-text">هذه الفضفضة غير موجودة أو حُذفت.</p>
            <Link href="/rants" className="text-sm text-accent hover:underline">
              تصفّح كل الفضفضات
            </Link>
          </div>
        ) : (
          <RantCard post={post} isAuthenticated={isAuthenticated} variant="detail" />
        )}
      </main>
      <Footer />
    </div>
  )
}
