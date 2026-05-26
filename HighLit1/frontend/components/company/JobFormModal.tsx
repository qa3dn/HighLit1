'use client'

import { useState } from 'react'
import { X, Loader2, Save, Send } from 'lucide-react'
import { useCreateJob, useUpdateJob } from '@/hooks/useJobs'
import { getApiErrorMessage } from '@/lib/apiError'
import type {
  Job,
  JobInput,
  JobType,
  EmploymentType,
  Workplace,
  Experience,
} from '@/lib/api/jobs'
import {
  JOB_TYPE_LABEL,
  EMPLOYMENT_LABEL,
  WORKPLACE_LABEL,
  EXPERIENCE_LABEL,
} from '@/lib/jobMeta'

const fieldClass =
  'w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent'

export function JobFormModal({
  companySlug,
  job,
  onClose,
}: {
  companySlug: string
  job?: Job
  onClose: () => void
}) {
  const create = useCreateJob()
  const update = useUpdateJob()
  const editing = !!job
  const [error, setError] = useState('')
  const [skillsText, setSkillsText] = useState((job?.skills ?? []).join('، '))
  const [form, setForm] = useState<JobInput>({
    title: job?.title ?? '',
    description: job?.description ?? '',
    location: job?.location ?? '',
    min_salary: job?.min_salary ?? 0,
    max_salary: job?.max_salary ?? 0,
    currency: job?.currency ?? 'JOD',
    job_type: job?.job_type ?? 'PAID',
    employment_type: job?.employment_type ?? 'FULL_TIME',
    workplace_type: job?.workplace_type ?? 'ONSITE',
    experience_level: job?.experience_level ?? 'ENTRY',
    application_deadline: job?.application_deadline ?? null,
  })

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const pending = create.isPending || update.isPending

  const submit = (status: 'DRAFT' | 'PUBLISHED') => {
    setError('')
    if (!form.title?.trim()) {
      setError('عنوان الوظيفة مطلوب.')
      return
    }
    if (!form.description?.trim()) {
      setError('وصف الوظيفة مطلوب.')
      return
    }
    if (form.min_salary && form.max_salary && form.min_salary > form.max_salary) {
      setError('الحد الأدنى للراتب أكبر من الحد الأقصى.')
      return
    }
    const skills = skillsText
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const payload: JobInput = { ...form, status, skills, company_slug: companySlug }
    const onError = (e: unknown) => setError(getApiErrorMessage(e, 'تعذّر حفظ الوظيفة.'))
    if (editing) {
      update.mutate({ id: job!.id, payload }, { onSuccess: onClose, onError })
    } else {
      create.mutate(payload, { onSuccess: onClose, onError })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-dark bg-gray-light p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text">{editing ? 'تعديل الوظيفة' : 'نشر وظيفة جديدة'}</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">المسمى الوظيفي *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">الوصف *</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={6}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">النوع</label>
              <select value={form.job_type} onChange={(e) => set('job_type', e.target.value as JobType)} className={fieldClass}>
                {(Object.keys(JOB_TYPE_LABEL) as JobType[]).map((k) => (
                  <option key={k} value={k}>{JOB_TYPE_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">الدوام</label>
              <select value={form.employment_type} onChange={(e) => set('employment_type', e.target.value as EmploymentType)} className={fieldClass}>
                {(Object.keys(EMPLOYMENT_LABEL) as EmploymentType[]).map((k) => (
                  <option key={k} value={k}>{EMPLOYMENT_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">مكان العمل</label>
              <select value={form.workplace_type} onChange={(e) => set('workplace_type', e.target.value as Workplace)} className={fieldClass}>
                {(Object.keys(WORKPLACE_LABEL) as Workplace[]).map((k) => (
                  <option key={k} value={k}>{WORKPLACE_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">مستوى الخبرة</label>
              <select value={form.experience_level} onChange={(e) => set('experience_level', e.target.value as Experience)} className={fieldClass}>
                {(Object.keys(EXPERIENCE_LABEL) as Experience[]).map((k) => (
                  <option key={k} value={k}>{EXPERIENCE_LABEL[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">الموقع</label>
              <input value={form.location} onChange={(e) => set('location', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">آخر موعد للتقديم</label>
              <input
                type="date"
                value={form.application_deadline ?? ''}
                onChange={(e) => set('application_deadline', e.target.value || null)}
                dir="ltr"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">الراتب من (شهري)</label>
              <input
                type="number"
                value={form.min_salary || ''}
                onChange={(e) => set('min_salary', Number(e.target.value) || 0)}
                dir="ltr"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">الراتب إلى (شهري)</label>
              <input
                type="number"
                value={form.max_salary || ''}
                onChange={(e) => set('max_salary', Number(e.target.value) || 0)}
                dir="ltr"
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-secondary">المهارات (افصل بفاصلة)</label>
            <input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React، TypeScript، Django"
              className={fieldClass}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              onClick={() => submit('DRAFT')}
              disabled={pending}
              className="flex items-center gap-2 rounded-lg border border-gray-dark px-4 py-2 text-sm text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> حفظ كمسودة
            </button>
            <button
              onClick={() => submit('PUBLISHED')}
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {editing ? 'حفظ ونشر' : 'نشر'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
