'use client'

import { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

const locations = ['عمان', 'إربد', 'الزرقاء', 'العقبة']

interface JobFiltersProps {
  onFilter: (filters: {
    location?: string
    minSalary?: number
    maxSalary?: number
  }) => void
}

export function JobFilters({ onFilter }: JobFiltersProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [minSalary, setMinSalary] = useState<string>('')
  const [maxSalary, setMaxSalary] = useState<string>('')

  const handleApply = () => {
    onFilter({
      location: selectedLocation || undefined,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
    })
  }

  const handleReset = () => {
    setSelectedLocation('')
    setMinSalary('')
    setMaxSalary('')
    onFilter({})
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">فلترة الوظائف</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">الموقع</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">جميع المواقع</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">الراتب الأدنى</label>
          <input
            type="number"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">الراتب الأعلى</label>
          <input
            type="number"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleApply} variant="primary" className="flex-1">
            تطبيق
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            إعادة تعيين
          </Button>
        </div>
      </div>
    </Card>
  )
}

