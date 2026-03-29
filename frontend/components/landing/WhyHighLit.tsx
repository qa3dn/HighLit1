'use client'

import { Card } from '../ui/Card'

const reasons = [
  {
    title: 'مش بس كود',
    description: 'هون بتحكي عن الشغل، الضغط، والنجاح بدون ما تشرح من الصفر.',
    code: 'talk()',
  },
  {
    title: 'مجتمع فاهم عليك',
    description: 'ناس عايشة نفس يلي انت عايشه، نفس السوق، ونفس التحديات كل يوم.',
    code: 'community.connect()',
  },
  {
    title: 'هوية محلية بروح عالمية',
    description: 'من الأردن… وبمستوى عالمي.',
    code: 'local.global()',
  },
  {
    title: 'بدون تصنّع',
    description: 'نقاش حقيقي، كود حقيقي، وتجارب حقيقية.',
    code: 'authentic()',
  },
]

export function WhyHighLit() {
  return (
    <section className="py-30 bg-bg" dir="rtl">
      <div className="container-custom">
        <h2 className="text-display-sm font-bold text-center mb-4 text-text">
          ليش HighLit؟
        </h2>
        <div className="text-center mb-12 font-mono text-accent text-sm" dir="ltr">
          <span className="glow-accent">if (understand) {'{'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-glow hover:border-accent transition-all duration-300 cursor-default border border-gray-dark bg-gray-light"
            >
              <div className="font-mono text-accent text-xs mb-4 glow-accent" dir="ltr">
                {reason.code}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">
                {reason.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {reason.description}
              </p>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12 font-mono text-accent text-sm" dir="ltr">
          <span className="glow-accent">{'}'}</span>
        </div>
      </div>
    </section>
  )
}
