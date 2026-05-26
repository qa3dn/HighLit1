'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { WhyHighLit } from '@/components/landing/WhyHighLit'
import { PlatformSections } from '@/components/landing/PlatformSections'
import { CommunityHighlights } from '@/components/landing/CommunityHighlights'
import { RanksSystem } from '@/components/landing/RanksSystem'
import { FinalCTA } from '@/components/landing/FinalCTA'

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      <Header />
      <main>
        <Hero />
        <WhyHighLit />
        <PlatformSections />
        <CommunityHighlights />
        <RanksSystem />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

