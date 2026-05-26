'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { playClickSound } from '@/lib/audio'

export function Hero() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setShowPrompt(true), 200)
    const timer2 = setTimeout(() => setShowTitle(true), 600)
    const timer3 = setTimeout(() => setShowSubtitle(true), 1200)
    const timer4 = setTimeout(() => setShowDescription(true), 1800)
    const timer5 = setTimeout(() => setShowCTA(true), 2400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-bg px-4 py-20 sm:px-6 sm:py-28 lg:py-30" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        {/* Technical Accent */}
        <div 
          className={`mb-4 font-mono text-accent text-xl transition-all duration-1000 sm:mb-6 sm:text-2xl md:text-3xl ${
            showPrompt ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
          dir="ltr"
        >
          <span className="glow-accent animate-pulse">&gt;_</span>
        </div>

        {/* Main Title */}
        <div 
          className={`mb-6 transition-all duration-1000 sm:mb-10 ${
            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="mb-4 text-5xl font-bold leading-none tracking-tight text-text sm:mb-6 sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="bg-gradient-to-r from-text via-accent to-text bg-clip-text text-transparent animate-gradient">
              HighLit
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div 
          className={`mb-6 transition-all duration-1000 sm:mb-8 ${
            showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="mb-4 text-xl font-medium leading-snug text-text sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl">
            هون الكود بحكي… وإحنا منسمع
          </h2>
        </div>

        {/* Description */}
        <div 
          className={`mb-10 transition-all duration-1000 sm:mb-14 ${
            showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-text sm:text-lg md:text-xl lg:text-2xl">
            مجتمع للمبرمجين بدمج بين النقاش التقني، ومشاركة الكود، والفضفضة المهنية — بلغة منفهمها.
          </p>
        </div>

        {/* CTA Terminal Link */}
        <div 
          className={`flex justify-center items-center transition-all duration-1000 ${
            showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Link
            href="/rants"
            onClick={playClickSound}
            className="group inline-flex cursor-pointer items-center gap-2 font-mono text-lg text-accent transition-all duration-300 hover:scale-105 sm:gap-3 sm:text-2xl md:text-3xl"
            dir="rtl"
          >
            <span className="text-2xl text-accent transition-all group-hover:glow-accent sm:text-3xl">&gt;</span>
            <span className="font-semibold text-text transition-colors group-hover:text-accent">بلش فضفضة</span>
            <span className="cursor-blink animate-pulse text-2xl text-accent sm:text-3xl">_</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
