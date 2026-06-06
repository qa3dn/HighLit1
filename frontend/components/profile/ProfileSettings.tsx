'use client'

import { useState, type ChangeEvent } from 'react'
import { Save, Shield, Github, Camera, Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/hooks/useProfile'
import { uploadFile } from '@/lib/api/uploads'
import { getApiErrorMessage } from '@/lib/apiError'
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadError, setUploadError] = useState('')

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

  const uploadImage = async (
    event: ChangeEvent<HTMLInputElement>,
    field: 'avatar_url' | 'banner_url',
  ) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('الرجاء اختيار ملف صورة (JPEG/PNG/WebP).')
      return
    }
    setUploadError('')
    const setUploading = field === 'avatar_url' ? setUploadingAvatar : setUploadingBanner
    setUploading(true)
    try {
      const res = await uploadFile(file)
      set(field, res.url)
    } catch (err) {
      setUploadError(getApiErrorMessage(err, 'تعذّر رفع الصورة.'))
    } finally {
      setUploading(false)
    }
  }

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
  const avatarUrl = value('avatar_url', '') as string
  const bannerUrl = value('banner_url', '') as string

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
        {/* Avatar + banner upload (with live preview) */}
        <div className="space-y-2">
          <span className="block text-sm text-text-secondary">الصورة الشخصية والغلاف</span>
          <div className="relative mb-9">
            {/* Banner */}
            <label className="group relative block h-32 w-full cursor-pointer overflow-hidden rounded-xl border border-gray-dark bg-gradient-to-l from-accent/15 via-bg to-bg sm:h-40">
              {bannerUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                {uploadingBanner ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                    <Camera className="h-4 w-4" /> تغيير الغلاف
                  </span>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, 'banner_url')} />
            </label>

            {/* Avatar, overlapping the banner */}
            <label className="group absolute -bottom-7 right-4 h-20 w-20 cursor-pointer overflow-hidden rounded-2xl border-4 border-gray-light bg-bg">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-mono text-2xl font-bold text-accent">
                  {(user.username || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Camera className="h-4 w-4 text-white" />
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, 'avatar_url')} />
            </label>
          </div>
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
          <p className="text-xs text-text-secondary">
            انقر على الغلاف أو الصورة لرفع صورة من جهازك (JPEG/PNG/WebP، حتى 5 ميغابايت).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
