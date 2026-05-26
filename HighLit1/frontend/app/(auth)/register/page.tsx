'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { BackgroundCode } from '@/components/auth/BackgroundCode'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text relative">
      <BackgroundCode />
      <Header />
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex items-center justify-center min-h-[70vh]">
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}

