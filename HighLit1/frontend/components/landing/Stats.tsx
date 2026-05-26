const stats = [
  { label: 'سبّة على الـ CSS', value: '+10k', icon: '😤' },
  { label: 'كود تنظف من الـ Spaghetti', value: '+500', icon: '🍝' },
  { label: 'مبرمج لقوا شغل براتب محترم', value: '+50', icon: '🎉' },
  { label: 'أكواب قهوة بردت', value: 'Infinite', icon: '☕' },
]

export function Stats() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-5xl mb-4">{stat.icon}</div>
            <div className="text-4xl font-bold text-primary-400 mb-2">{stat.value}</div>
            <div className="text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

