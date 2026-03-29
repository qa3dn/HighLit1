'use client'

const highlights = [
  {
    type: 'rant',
    content: 'الكود اشتغل بعد 6 ساعات… السبب؟ فاصلة.',
    author: 'مبرمج مكافح',
    timestamp: 'منذ ساعتين',
  },
  {
    type: 'comment',
    content: 'أنا كمان واجهت نفس المشكلة، الحل كان في الـ cache',
    author: 'مشارك نشط',
    timestamp: 'منذ 4 ساعات',
  },
  {
    type: 'code',
    content: 'function solveProblem() { return "coffee"; }',
    comment: 'هذا الحل أنقذني من يوم كامل من الـ debugging',
    author: 'مطور ذكي',
    timestamp: 'منذ يوم',
  },
]

export function CommunityHighlights() {
  return (
    <section className="py-30 bg-bg" dir="rtl">
      <div className="container-custom">
        <h2 className="text-display-sm font-bold text-center mb-4 text-text">
          من قلب المجتمع
        </h2>
        <div className="text-center mb-12 font-mono text-accent text-sm" dir="ltr">
          <span className="glow-accent">console.log(community.quotes)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="bg-gray-light rounded-2xl p-6 border border-gray-dark hover:border-accent hover:shadow-glow transition-all duration-300"
            >
              {highlight.type === 'code' ? (
                <div>
                  <div className="bg-bg rounded-lg p-4 mb-4 font-mono text-sm border border-accent/30" dir="ltr">
                    <code className="text-accent">{highlight.content}</code>
                  </div>
                  <p className="text-text-secondary italic mb-4">
                    "{highlight.comment}"
                  </p>
                </div>
              ) : (
                <p className="text-lg text-text mb-4 leading-relaxed">
                  "{highlight.content}"
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span className="text-accent">—</span>
                <span className="font-medium">{highlight.author}</span>
                <span className="text-accent">•</span>
                <span>{highlight.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
