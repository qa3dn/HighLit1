'use client'

import { useState } from 'react'
import { Save, Shield, Github } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/hooks/useProfile'
import { playClickSound } from '@/lib/audio'
import type { ProfileUpdate } from '@/lib/api/profile'

const VISIBILITY_TOGGLES: { key: keyof ProfileUpdate; label: string }[] = [
  { key: 'show_posts', label: 'إظهار الفضفضات' },
  { key: 'show_code', label: 'إظهار المستودعات' },
  { key: 'show_ideas', label: 'إظهار الأفكار' },
  { key: 'show_activity', label: 'إظهار النشاط' },
]

export function ProfileSettings() {
  const { data: user } = useCurrentUser()
  const update = useUpdateProfile(user?.id ?? '')
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState<ProfileUpdate>({})

  if (!user) {
    return <div className="py-12 text-center font-mono text-text-secondary">سجّل الدخول لتعديل ملفك.</div>
  }

  // Effective value = local edit if present, else the server value.
  const value = <K extends keyof ProfileUpdate>(key: K, fallback: ProfileUpdate[K]): ProfileUpdate[K] =>
    (form[key] !== undefined
      ? form[key]
      : ((user as unknown as Record<string, unknown>)[key] as ProfileUpdate[K])) ?? fallback

  const set = <K extends keyof ProfileUpdate>(key: K, val: ProfileUpdate[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleSave = () => {
    playClickSound()
    update.mutate(form, {
      onSuccess: () => {
        setSaved(true)
        setForm({})
        setTimeout(() => setSaved(false), 2500)
      },
    })
  }

  const isPrivate = value('profile_visibility', 'PUBLIC') === 'PRIVATE'

  return (
    <div className="mx-auto max-w-2xl space-y-6" dir="rtl">
      <h2 className="text-xl font-bold text-text">إعدادات الملف الشخصي</h2>

      {/* Identity */}
      <section className="space-y-4 rounded-xl border border-gray-dark bg-gray-light p-5">
        <h3 className="text-sm font-semibold text-text-secondary">الهوية</h3>
        <Field label="نبذة">
          <textarea
            value={value('bio', '') as string}
            onChange={(e) => set('bio', e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
        </Field>
        <Field label="الحالة">
          <input
            value={value('status_text', '') as string}
            onChange={(e) => set('status_text', e.target.value)}
            maxLength={160}
            className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رابط الصورة">
            <input
              value={value('avatar_url', '') as string}
              onChange={(e) => set('avatar_url', e.target.value)}
              dir="ltr"
              className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </Field>
          <Field label="رابط الغلاف (Banner)">
            <input
              value={value('banner_url', '') as string}
              onChange={(e) => set('banner_url', e.target.value)}
              dir="ltr"
              className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </Field>
          <Field label="الجامعة">
            <input
              value={value('university', '') as string}
              onChange={(e) => set('university', e.target.value)}
              className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </Field>
          <Field label="التخصص">
            <input
              value={value('major', '') as string}
              onChange={(e) => set('major', e.target.value)}
              className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </Field>
        </div>
      </section>

      {/* GitHub */}
      <section className="space-y-3 rounded-xl border border-gray-dark bg-gray-light p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <Github className="h-4 w-4" /> ربط GitHub
        </h3>
        <Field label="اسم مستخدم GitHub">
          <input
            value={value('github_username', '') as string}
            onChange={(e) => set('github_username', e.target.value.replace(/^@/, ''))}
            placeholder="octocat"
            dir="ltr"
            className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 font-mono text-sm text-text outline-none focus:border-accent"
          />
        </Field>
        <p className="text-xs text-text-secondary">
          نعرض مستودعاتك العامة فقط — لا نطلب أي صلاحيات أو رموز وصول.
        </p>
      </section>

      {/* Privacy */}
      <section className="space-y-4 rounded-xl border border-gray-dark bg-gray-light p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <Shield className="h-4 w-4" /> الخصوصية
        </h3>
        <Field label="ظهور الملف الشخصي">
          <div className="flex gap-2">
            {(['PUBLIC', 'PRIVATE'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => set('profile_visibility', option)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  value('profile_visibility', 'PUBLIC') === option
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-gray-dark text-text-secondary hover:border-accent/40'
                }`}
              >
                {option === 'PUBLIC' ? 'عام' : 'خاص'}
              </button>
            ))}
          </div>
        </Field>
        <div className={`space-y-2 ${isPrivate ? 'pointer-events-none opacity-50' : ''}`}>
          {VISIBILITY_TOGGLES.map((toggle) => (
            <label
              key={toggle.key as string}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text"
            >
              {toggle.label}
              <input
                type="checkbox"
                checked={Boolean(value(toggle.key, true))}
                onChange={(e) => set(toggle.key, e.target.checked as never)}
                className="h-4 w-4 accent-accent"
              />
            </label>
          ))}
          {isPrivate && (
            <p className="text-xs text-text-secondary">الملف خاص — كل الأقسام مخفية عن الآخرين.</p>
          )}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={update.isPending || Object.keys(form).length === 0}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {update.isPending ? '...جارٍ الحفظ' : 'حفظ التغييرات'}
        </button>
        {saved && <span className="text-sm text-accent">تم الحفظ ✓</span>}
        {update.isError && <span className="text-sm text-red-400">تعذّر الحفظ.</span>}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  )
}
