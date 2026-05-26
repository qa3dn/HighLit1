'use client'

import { useState } from 'react'
import { Loader2, Building2 } from 'lucide-react'
import { useCreateCompany } from '@/hooks/useCompanies'
import { getApiErrorMessage } from '@/lib/apiError'
import type { CompanyInput } from '@/lib/api/companies'

const fieldClass =
  'w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent'

export function CreateCompanyForm() {
  const create = useCreateCompany()
  const [error, setError] = useState('')
  const [form, setForm] = useState<CompanyInput>({
    name: '',
    tagline: '',
    industry: '',
    location: '',
    logo_url: '',
  })

  const set = <K extends keyof CompanyInput>(key: K, value: CompanyInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = () => {
    setError('')
    if (!form.name.trim()) {
      setError('اسم الشركة مطلوب.')
      return
    }
    create.mutate(form, {
      onError: (e: unknown) => setError(getApiErrorMessage(e, 'تعذّر إنشاء الشركة.')),
    })
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-gray-dark bg-gray-light p-6" dir="rtl">
      <div className="mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold text-text">أنشئ ملف شركتك</h2>
      </div>
      <p className="mb-4 text-sm text-text-secondary">
        أنشئ ملف شركتك لتتمكّن من نشر الوظائف واستقبال المتقدمين.
      </p>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-text-secondary">اسم الشركة *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-secondary">الشعار (سطر تعريفي)</label>
          <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className={fieldClass} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-text-secondary">المجال</label>
            <input value={form.industry} onChange={(e) => set('industry', e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">الموقع</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} className={fieldClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-text-secondary">رابط الشعار (Logo)</label>
          <input value={form.logo_url} onChange={(e) => set('logo_url', e.target.value)} dir="ltr" className={fieldClass} />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={submit}
          disabled={create.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
          إنشاء الشركة
        </button>
      </div>
    </div>
  )
}
