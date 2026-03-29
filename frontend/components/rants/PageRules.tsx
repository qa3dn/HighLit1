'use client'

import { Card } from '../ui/Card'

export function PageRules() {
  const rules = [
    'إحنا نفضفض، مش نجلد',
    'الإهانة مش مقبولة',
    'كلنا مرّينا بهيك موقف',
    'النصيحة اختيارية، التضامن واجب',
  ]

  return (
    <Card className="p-6 mt-8 border-accent/30" dir="rtl">
      <h3 className="text-lg font-bold text-text mb-4 font-mono">قوانين الصفحة</h3>
      <ul className="space-y-2">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start gap-2 text-text-secondary font-mono text-sm">
            <span className="text-accent mt-1">•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

