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
    <section className="min-h-screen flex items-center justify-center bg-bg py-30 relative overflow-hidden" dir="rtl">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Technical Accent */}
        <div 
          className={`mb-8 font-mono text-accent text-2xl md:text-3xl transition-all duration-1000 ${
            showPrompt ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
          dir="ltr"
        >
          <span className="glow-accent animate-pulse">&gt;_</span>
        </div>

        {/* Main Title */}
        <div 
          className={`mb-12 transition-all duration-1000 ${
            showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-bold text-text mb-8 leading-none tracking-tight">
            <span className="bg-gradient-to-r from-text via-accent to-text bg-clip-text text-transparent animate-gradient">
              HighLit
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div 
          className={`mb-10 transition-all duration-1000 ${
            showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-text font-medium mb-8 leading-tight">
            هون الكود بحكي… وإحنا منسمع
          </h2>
        </div>

        {/* Description */}
        <div 
          className={`mb-16 transition-all duration-1000 ${
            showDescription ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-text max-w-4xl mx-auto leading-relaxed">
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
            className="group font-mono text-accent text-2xl md:text-3xl lg:text-4xl hover:text-accent transition-all cursor-pointer inline-flex items-center gap-4 hover:scale-105 transform duration-300"
            dir="rtl"
          >
            <span className="text-accent group-hover:glow-accent transition-all text-3xl md:text-4xl lg:text-5xl">&gt;</span>
            <span className="text-text group-hover:text-accent transition-colors font-semibold">بلش فضفضة</span>
            <span className="text-accent animate-pulse cursor-blink text-3xl md:text-4xl lg:text-5xl">_</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
