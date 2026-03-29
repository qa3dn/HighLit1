'use client'

import { Window } from '../terminal/Window'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'

interface Job {
  id: string
  company_name: string
  title: string
  location: string
  salary_range_min?: number
  salary_range_max?: number
  description: string
}

interface JobPopupProps {
  job: Job | null
  onClose: () => void
  onApply: (jobId: string) => void
}

export function JobPopup({ job, onClose, onApply }: JobPopupProps) {
  if (!job) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl">
        <Window
          title="Job Details"
          path="/bin/jobs/"
          onClose={onClose}
        >
          <div className="font-mono text-sm space-y-4">
            <div>
              <div className="text-terminal-accent mb-2"># Company:</div>
              <div className="text-terminal-text">{job.company_name}</div>
            </div>
            <div>
              <div className="text-terminal-accent mb-2"># Position:</div>
              <div className="text-terminal-text">{job.title}</div>
            </div>
            <div>
              <div className="text-terminal-accent mb-2"># Location:</div>
              <div className="text-terminal-text">{job.location}</div>
            </div>
            {(job.salary_range_min || job.salary_range_max) && (
              <div>
                <div className="text-terminal-accent mb-2"># Salary:</div>
                <div className="text-terminal-text">
                  {job.salary_range_min && job.salary_range_max
                    ? `${job.salary_range_min} - ${job.salary_range_max} JD`
                    : job.salary_range_min
                    ? `From ${job.salary_range_min} JD`
                    : `Up to ${job.salary_range_max} JD`}
                </div>
              </div>
            )}
            <div>
              <div className="text-terminal-accent mb-2"># Description:</div>
              <pre className="text-terminal-text whitespace-pre-wrap font-mono text-xs bg-terminal-bg p-4 border border-terminal-gray">
                {job.description}
              </pre>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-terminal-gray">
              <Button variant="terminal" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="terminal"
                size="sm"
                onClick={() => {
                  playClickSound()
                  onApply(job.id)
                }}
                className="text-terminal-accent"
              >
                sudo apply --now
              </Button>
            </div>
          </div>
        </Window>
      </div>
    </div>
  )
}

