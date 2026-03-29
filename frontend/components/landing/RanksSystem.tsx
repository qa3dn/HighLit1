'use client'

const ranks = [
  {
    name: 'مبتدئ حابّط',
    description: 'بداية الرحلة، كل شيء جديد ومثير',
    points: '0-100',
    code: 'rank.beginner',
  },
  {
    name: 'مكافح كود',
    description: 'بدأت تفهم، بس لسا بتواجه تحديات',
    points: '100-500',
    code: 'rank.struggler',
  },
  {
    name: 'سنيور متبهذل',
    description: 'خبرة حقيقية، بس لسا بتتعلم',
    points: '500-2000',
    code: 'rank.senior',
  },
  {
    name: 'أسطورة السيرفر',
    description: 'مستوى متقدم، بتساعد غيرك',
    points: '2000-5000',
    code: 'rank.legend',
  },
  {
    name: 'شيخ الكود',
    description: 'المرجع، الخبير، المثال',
    points: '5000+',
    code: 'rank.master',
  },
]

export function RanksSystem() {
  return (
    <section className="py-30 bg-gray-light" dir="rtl">
      <div className="container-custom">
        <h2 className="text-display-sm font-bold text-center mb-4 text-text">
          رتب المجتمع
        </h2>
        <div className="text-center mb-12 font-mono text-accent text-sm" dir="ltr">
          <span className="glow-accent">const ranks = {'{'}</span>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-light rounded-2xl border border-gray-dark p-8">
            <div className="space-y-4">
              {ranks.map((rank, index) => (
                <div
                  key={index}
                  className="flex items-center gap-6 p-4 rounded-xl border border-gray-dark hover:border-accent hover:bg-gray transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent font-bold text-lg font-mono glow-accent">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-text">
                        {rank.name}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/50 font-mono">
                        {rank.points} XP
                      </span>
                    </div>
                    <div className="font-mono text-accent text-xs mb-1" dir="ltr">
                      {rank.code}
                    </div>
                    <p className="text-text-secondary text-sm">
                      {rank.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-dark text-center text-sm text-text-secondary">
              الرتب مبنية على المشاركة، مش عدد السنين.
            </div>
          </div>
        </div>
        <div className="text-center mt-12 font-mono text-accent text-sm" dir="ltr">
          <span className="glow-accent">{'};'}</span>
        </div>
      </div>
    </section>
  )
}
