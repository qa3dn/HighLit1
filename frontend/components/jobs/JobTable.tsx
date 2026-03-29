'use client'

import { playClickSound } from '@/lib/audio'

interface Job {
  id: string
  company_name: string
  title: string
  location: string
  salary_range_min?: number
  salary_range_max?: number
}

interface JobTableProps {
  jobs: Job[]
  onJobSelect: (job: Job) => void
}

export function JobTable({ jobs, onJobSelect }: JobTableProps) {
  return (
    <div className="font-mono text-sm">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-2 p-2 border-b-2 border-terminal-accent text-terminal-accent font-bold" dir="ltr">
        <div>[JOB_ID]</div>
        <div>[COMPANY]</div>
        <div>[TECH_STACK]</div>
        <div>[LOCATION]</div>
        <div>[SALARY_STATUS]</div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-terminal-gray">
        {jobs.map((job, index) => (
          <div
            key={job.id}
            className="grid grid-cols-5 gap-2 p-2 hover:bg-terminal-gray cursor-pointer transition-colors"
            dir="ltr"
            onClick={() => {
              playClickSound()
              onJobSelect(job)
            }}
          >
            <div className="text-terminal-accent">#{index + 1}</div>
            <div className="text-terminal-text">{job.company_name}</div>
            <div className="text-terminal-text">{job.title}</div>
            <div className="text-terminal-text">{job.location}</div>
            <div className="text-terminal-accent">
              {job.salary_range_min && job.salary_range_max
                ? `${job.salary_range_min}-${job.salary_range_max} JD`
                : 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

