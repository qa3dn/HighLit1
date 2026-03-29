'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Window } from '@/components/terminal/Window'
import { JobTable } from '@/components/jobs/JobTable'
import { SearchBar } from '@/components/jobs/SearchBar'
import { JobPopup } from '@/components/jobs/JobPopup'
import { api } from '@/lib/api'

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: jobs } = useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: async () => {
      const { data } = await api.get('/jobs')
      // Filter by search query
      if (searchQuery) {
        return data.filter((job: any) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return data
    },
  })

  const handleJobSelect = (job: any) => {
    // Fetch full job details
    api.get(`/jobs/${job.id}`).then(({ data }) => {
      setSelectedJob(data)
    })
  }

  const handleApply = (jobId: string) => {
    // Handle job application
    console.log('Applying to job:', jobId)
    setSelectedJob(null)
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text relative">
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <Window title="Job Debugger" path="/bin/jobs" className="w-full">
            <div className="space-y-4">
              <SearchBar onSearch={setSearchQuery} />
              {jobs && jobs.length > 0 ? (
                <JobTable jobs={jobs} onJobSelect={handleJobSelect} />
              ) : (
                <div className="text-terminal-gray font-mono text-sm text-center py-8">
                  No jobs found. Try a different search.
                </div>
              )}
            </div>
          </Window>
        </div>
      </main>
      <Footer />
      <JobPopup
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={handleApply}
      />
    </div>
  )
}

