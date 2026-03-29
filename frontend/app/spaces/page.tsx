'use client'

import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function SpacesPage() {
  const { data: spaces } = useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const { data } = await api.get('/spaces')
      return data
    },
  })

  const { data: liveSpaces } = useQuery({
    queryKey: ['live-spaces'],
    queryFn: async () => {
      const { data } = await api.get('/spaces/live')
      return data
    },
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">قعدة مبرمجين</h1>

          {Array.isArray(liveSpaces) && liveSpaces.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">جلسات مباشرة</h2>
              <div className="space-y-4">
                {liveSpaces.map((space: any) => (
                  <Card key={space.id}>
                    <h3 className="text-xl font-semibold mb-2">{space.title}</h3>
                    <p className="text-gray-400 mb-4">{space.description}</p>
                    <Link
                      href={`/spaces/${space.id}`}
                      className="text-primary-400 hover:text-primary-300"
                    >
                      انضم للجلسة →
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-4">جميع الجلسات</h2>
            <div className="space-y-4">
              {Array.isArray(spaces) && spaces.map((space: any) => (
                <Card key={space.id}>
                  <h3 className="text-xl font-semibold mb-2">{space.title}</h3>
                  <p className="text-gray-400 mb-4">{space.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {space.status === 'LIVE' ? '🔴 مباشر' : 'مجدولة'}
                    </span>
                    <Link
                      href={`/spaces/${space.id}`}
                      className="text-primary-400 hover:text-primary-300"
                    >
                      عرض التفاصيل →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

