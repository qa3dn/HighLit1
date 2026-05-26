'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SubmitProjectWizard } from '@/components/showcase/SubmitProjectWizard'

export default function NewProjectPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login?next=/code/new')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <h1 className="mb-8 text-center text-2xl font-bold text-text sm:text-3xl" dir="rtl">
          نشر مشروع جديد
        </h1>
        <SubmitProjectWizard />
      </main>
      <Footer />
    </div>
  )
}
