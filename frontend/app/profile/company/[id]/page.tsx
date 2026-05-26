'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// The company portal moved out of the profile to its own top-level route.
export default function LegacyCompanyRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/company')
  }, [router])
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-text">
      <div className="font-mono text-accent">...جارٍ التحويل</div>
    </div>
  )
}
