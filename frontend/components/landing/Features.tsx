import { Card } from '../ui/Card'

const features = [
  {
    title: 'إفش غلك (مجهول)',
    description: 'مديرك طلب تعديل يوم الخميس الساعة 4؟ فضفض بدون ما حدا يعرف مين إنت.',
    icon: '🔒',
  },
  {
    title: 'Roast My Code',
    description: 'حاسس كودك فنان؟ ارفعه وخلي "الوحوش" يعطوك رأيهم الصريح (بدون مجاملات).',
    icon: '🔥',
  },
  {
    title: 'وين في شغل؟',
    description: 'وظائف تقنية من شركات بتفهم شو يعني Commit وما بتطلب 20 سنة خبرة بـ Framework نزل مبارح.',
    icon: '💼',
  },
  {
    title: 'قعدة مبرمجين',
    description: 'مساحات صوتية لنحكي عن الـ Burnout، والـ AI اللي رح ياخد شغلنا (أو لا).',
    icon: '🎙️',
  },
]

export function Features() {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-4xl font-bold text-center mb-12">ليه "كود وفضفض"؟</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

