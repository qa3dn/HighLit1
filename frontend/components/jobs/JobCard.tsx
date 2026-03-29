'use client'

import { Card } from '../ui/Card'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Job {
  id: string
  company_name: string
  title: string
  location: string
  salary_range_min?: number
  salary_range_max?: number
  description: string
  created_at: string
  is_promoted: boolean
}

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className={`mb-6 ${job.is_promoted ? 'border-primary-500' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
          <p className="text-primary-400 mb-2">{job.company_name}</p>
          <p className="text-gray-400 text-sm">{job.location}</p>
        </div>
        {job.is_promoted && (
          <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs">
            مميز
          </span>
        )}
      </div>
      <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>
      {(job.salary_range_min || job.salary_range_max) && (
        <p className="text-primary-400 font-semibold mb-4">
          {job.salary_range_min && job.salary_range_max
            ? `${job.salary_range_min} - ${job.salary_range_max} دينار`
            : job.salary_range_min
            ? `من ${job.salary_range_min} دينار`
            : `حتى ${job.salary_range_max} دينار`}
        </p>
      )}
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-sm">
          {formatDistanceToNow(new Date(job.created_at), {
            addSuffix: true,
            locale: ar,
          })}
        </span>
        <Link
          href={`/jobs/${job.id}`}
          className="text-primary-400 hover:text-primary-300"
        >
          عرض التفاصيل →
        </Link>
      </div>
    </Card>
  )
}

