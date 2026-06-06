'use client'

import Link from 'next/link'
import { MessageSquare, Code2, Mic, Briefcase, ArrowLeft } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

const sections = [
  {
    title: 'فش غلك',
    path: '/rants',
    icon: MessageSquare,
    description: 'مساحة آمنة بتحكي فيها عن الضغط، المشاكل، أو حتى المواقف المضحكة بالشغل.',
  },
  {
    title: 'فرجينا شغلك',
    path: '/code',
    icon: Code2,
    description: 'شارك مشاريعك كصور، فيديو، أو GitHub مع تفاصيل جامعتك وتخصصك للفلترة والاكتشاف.',
  },
  {
    title: 'قعدة مبرمجين',
    path: '/spaces',
    icon: Mic,
    description: 'جلسات صوتية ونقاشات صريحة عن التقنية والحياة المهنية بالأردن.',
  },
  {
    title: 'وين في شغل؟',
    path: '/jobs',
    icon: Briefcase,
    description: 'فرص عمل وتجارب حقيقية من السوق، وبدون ما نضحك عليك.',
  },
]

export function PlatformSections() {
  return (
    <section id="platform-sections" className="bg-gray-light py-16 sm:py-24 lg:py-30" dir="rtl">
      <div className="container-custom">
        <h2 className="mb-4 text-center text-2xl font-bold text-text sm:text-3xl md:text-display-sm">
          شو بتلاقي داخل HighLit؟
        </h2>
        <div className="mb-12 text-center font-mono text-sm text-accent" dir="ltr">
          <span className="glow-accent">const features = {'['}</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.path} href={section.path} onClick={playClickSound} className="group block">
                <div className="flex h-full flex-col rounded-2xl border border-gray-dark bg-bg p-8 transition-all duration-300 hover:border-accent hover:shadow-glow">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7" aria-hidden />
                    </div>
                    <span className="font-mono text-xs text-text-secondary transition-colors group-hover:text-accent" dir="ltr">
                      {section.path}
                    </span>
                  </div>

                  <h3 className="mb-3 text-2xl font-semibold text-text transition-colors group-hover:text-accent">
                    {section.title}
                  </h3>
                  <p className="leading-relaxed text-text-secondary">{section.description}</p>

                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    استكشف
                    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 text-center font-mono text-sm text-accent" dir="ltr">
          <span className="glow-accent">{'];'}</span>
        </div>
      </div>
    </section>
  )
}
