'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card } from '../ui/Card'

interface StressLevel {
  level: string
  message: string
  percentage: number
}

export function StressMeter() {
  const [stress, setStress] = useState<StressLevel | null>(null)

  useEffect(() => {
    const fetchStress = async () => {
      try {
        const { data } = await api.get('/stress')
        setStress(data)
      } catch (error) {
        console.error('Failed to fetch stress level:', error)
      }
    }
    fetchStress()
    const interval = setInterval(fetchStress, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (!stress) return null

  const getColor = () => {
    switch (stress.level) {
      case 'CRITICAL':
        return 'bg-red-600'
      case 'HIGH':
        return 'bg-orange-600'
      case 'MEDIUM':
        return 'bg-yellow-600'
      default:
        return 'bg-green-600'
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">مقياس الضغط البرمجي</h3>
      <div className="mb-2">
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className={`${getColor()} h-4 rounded-full transition-all`}
            style={{ width: `${stress.percentage}%` }}
          />
        </div>
      </div>
      <p className="text-gray-300">{stress.message}</p>
    </Card>
  )
}

