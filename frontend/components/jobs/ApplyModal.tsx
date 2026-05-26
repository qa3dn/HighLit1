'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle2, Send } from 'lucide-react'
import { useApplyToJob } from '@/hooks/useJobs'
import { getApiErrorMessage } from '@/lib/apiError'
import type { Job } from '@/lib/api/jobs'

export function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const apply = useApplyToJob(job.id)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const companyName = job.company_detail?.name ?? job.company

  const submit = () => {
    setError('')
    apply.mutate(
      { cover_letter: coverLetter, resume_url: resumeUrl },
      {
        onSuccess: () => setDone(true),
        onError: (e: unknown) => setError(getApiErrorMessage(e, 'تعذّر إرسال الطلب.')),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-dark bg-gray-light p-6">
        <button onClick={onClose} className="absolute left-4 top-4 text-text-secondary hover:text-accent">
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <h3 className="mt-3 text-lg font-bold text-text">تم إرسال طلبك!</h3>
            <p className="mt-1 text-sm text-text-secondary">سيظهر طلبك لدى {companyName}.</p>
            <button
              onClick={onClose}
              className="mt-5 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
            >
              تم
            </button>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-lg font-bold text-text">التقديم على: {job.title}</h3>
            <p className="mb-4 text-sm text-text-secondary">{companyName}</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">رسالة التقديم</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="لماذا أنت مناسب لهذه الوظيفة؟"
                  className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">رابط السيرة الذاتية (اختياري)</label>
                <input
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  dir="ltr"
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={submit}
                disabled={apply.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
              >
                {apply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                إرسال الطلب
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
