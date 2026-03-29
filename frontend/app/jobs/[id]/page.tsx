'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { CompanyReviewCard } from '@/components/jobs/CompanyReviewCard'
import { api } from '@/lib/api'

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string

  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}`)
      return data
    },
  })

  const { data: reviews } = useQuery({
    queryKey: ['job-reviews', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}/reviews`)
      return data
    },
  })

  if (!job) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-primary-400 text-xl mb-4">{job.company_name}</p>
            <p className="text-gray-400 mb-4">{job.location}</p>
            {(job.salary_range_min || job.salary_range_max) && (
              <p className="text-primary-400 font-semibold mb-4">
                {job.salary_range_min && job.salary_range_max
                  ? `${job.salary_range_min} - ${job.salary_range_max} دينار`
                  : job.salary_range_min
                  ? `من ${job.salary_range_min} دينار`
                  : `حتى ${job.salary_range_max} دينار`}
              </p>
            )}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
            </div>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4">تقييمات الشركة</h2>
            {reviews?.map((review: any) => (
              <CompanyReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

