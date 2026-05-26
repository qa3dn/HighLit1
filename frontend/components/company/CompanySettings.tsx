'use client'

import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { useUpdateCompany } from '@/hooks/useCompanies'
import { getApiErrorMessage } from '@/lib/apiError'
import type { Company, CompanyUpdate } from '@/lib/api/companies'

const SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: 'SOLO', label: '1' },
  { value: 'SMALL', label: '2-10' },
  { value: 'MEDIUM', label: '11-50' },
  { value: 'LARGE', label: '51-200' },
  { value: 'ENTERPRISE', label: '+201' },
]

const fieldClass =
  'w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  )
}

export function CompanySettings({ company }: { company: Company }) {
  const update = useUpdateCompany(company.slug)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<CompanyUpdate>({
    name: company.name,
    tagline: company.tagline,
    about: company.about,
    industry: company.industry,
    size: company.size,
    location: company.location,
    website: company.website,
    logo_url: company.logo_url,
    banner_url: company.banner_url,
  })

  const set = <K extends keyof CompanyUpdate>(key: K, value: CompanyUpdate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const save = () => {
    setError('')
    update.mutate(form, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      },
      onError: (e: unknown) => setError(getApiErrorMessage(e, 'تعذّر حفظ التغييرات.')),
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-text">إعدادات الشركة</h2>

      <section className="space-y-4 rounded-2xl border border-gray-dark bg-gray-light p-5">
        <h3 className="text-sm font-semibold text-text-secondary">الهوية</h3>
        <Field label="اسم الشركة">
          <input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} className={fieldClass} />
        </Field>
        <Field label="الشعار (سطر تعريفي)">
          <input value={form.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} className={fieldClass} />
        </Field>
        <Field label="نبذة عن الشركة">
          <textarea
            value={form.about ?? ''}
            onChange={(e) => set('about', e.target.value)}
            rows={4}
            className={fieldClass}
          />
        </Field>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-dark bg-gray-light p-5">
        <h3 className="text-sm font-semibold text-text-secondary">التفاصيل</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="المجال">
            <input value={form.industry ?? ''} onChange={(e) => set('industry', e.target.value)} className={fieldClass} />
          </Field>
          <Field label="حجم الشركة">
            <select value={form.size ?? 'SMALL'} onChange={(e) => set('size', e.target.value)} className={fieldClass}>
              {SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="الموقع">
            <input value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} className={fieldClass} />
          </Field>
          <Field label="الموقع الإلكتروني">
            <input value={form.website ?? ''} onChange={(e) => set('website', e.target.value)} dir="ltr" className={fieldClass} />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-dark bg-gray-light p-5">
        <h3 className="text-sm font-semibold text-text-secondary">الصور</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رابط الشعار (Logo)">
            <input value={form.logo_url ?? ''} onChange={(e) => set('logo_url', e.target.value)} dir="ltr" className={fieldClass} />
          </Field>
          <Field label="رابط الغلاف (Banner)">
            <input value={form.banner_url ?? ''} onChange={(e) => set('banner_url', e.target.value)} dir="ltr" className={fieldClass} />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={update.isPending}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
        >
          {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </button>
        {saved && <span className="text-sm text-accent">تم الحفظ ✓</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </div>
  )
}
