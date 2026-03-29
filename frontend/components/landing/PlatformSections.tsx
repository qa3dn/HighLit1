'use client'

import Link from 'next/link'
import { playClickSound } from '@/lib/audio'

const sections = [
  {
    title: 'فش غلك',
    path: '/rants',
    description: 'مساحة آمنة بتحكي فيها عن الضغط، المشاكل، أو حتى المواقف المضحكة بالشغل.',
    code: '/rants',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'فرجينا شغلك',
    path: '/code',
    description: 'استعرض كودك، خذ مراجعة، أو شاركنا حلك العبقري.',
    code: '/code',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'قعدة مبرمجين',
    path: '/spaces',
    description: 'جلسات صوتية ونقاشات صريحة عن التقنية والحياة المهنية بالأردن.',
    code: '/spaces',
    color: 'from-orange-500 to-red-500',
  },
  {
    title: 'وين في شغل؟',
    path: '/jobs',
    description: 'فرص عمل وتجارب حقيقية من السوق، وبدون ما نضحك عليك.',
    code: '/jobs',
    color: 'from-green-500 to-emerald-500',
  },
]

export function PlatformSections() {
  return (
    <section id="platform-sections" className="py-30 bg-gray-light" dir="rtl">
      <div className="container-custom">
        <h2 className="text-display-sm font-bold text-center mb-4 text-text">
          شو بتلاقي داخل HighLit؟
        </h2>
        <div className="text-center mb-12 font-mono text-accent text-sm" dir="ltr">
          <span className="glow-accent">const features = {'['}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <Link
              key={index}
              href={section.path}
              onClick={playClickSound}
              className="group block"
            >
              <div className="bg-gray-light rounded-2xl p-8 border border-gray-dark hover:border-accent hover:shadow-glow transition-all duration-300 h-full">
                <div className="font-mono text-accent text-xs mb-4 glow-accent" dir="ltr">
                  {section.code}
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.color} mb-6 group-hover:scale-110 transition-transform duration-300`}></div>
                <h3 className="text-2xl font-semibold mb-4 text-text group-hover:text-accent transition-colors">
                  {section.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12 font-mono text-accent text-sm" dir="ltr">
          <span className="glow-accent">{'];'}</span>
        </div>
      </div>
    </section>
  )
}
