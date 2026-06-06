'use client'

import { useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react'
import {
  X,
  Loader2,
  CheckCircle2,
  Send,
  Camera,
  Plus,
  Trash2,
  FileText,
  GraduationCap,
  Briefcase,
  Sparkles,
} from 'lucide-react'
import { useApplyToJob } from '@/hooks/useJobs'
import { useCurrentUser } from '@/hooks/useAuth'
import { uploadFile } from '@/lib/api/uploads'
import { getApiErrorMessage } from '@/lib/apiError'
import type { EducationEntry, ExperienceEntry, Job } from '@/lib/api/jobs'

const EMPTY_EDUCATION: EducationEntry = {
  degree: '',
  field: '',
  institution: '',
  start_year: '',
  end_year: '',
}
const EMPTY_EXPERIENCE: ExperienceEntry = {
  title: '',
  company: '',
  start: '',
  end: '',
  description: '',
}

const inputClass =
  'w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  )
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-bold text-text">
        <span className="text-accent">{icon}</span>
        {title}
      </h4>
      {children}
    </section>
  )
}

export function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const apply = useApplyToJob(job.id)
  const { data: me } = useCurrentUser()
  const companyName = job.company_detail?.name ?? job.company
  const requiredSkills = job.skills ?? []

  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [photoUrl, setPhotoUrl] = useState('')
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillDraft, setSkillDraft] = useState('')
  const [education, setEducation] = useState<EducationEntry[]>([])
  const [experience, setExperience] = useState<ExperienceEntry[]>([])
  const [resumeUrl, setResumeUrl] = useState('')
  const [resumeName, setResumeName] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [coverLetter, setCoverLetter] = useState('')

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [prefilled, setPrefilled] = useState(false)

  // Prefill from the signed-in profile once it arrives so the form starts
  // "complete" — the applicant only edits what's wrong.
  if (me && !prefilled) {
    setPrefilled(true)
    setFullName((v) => v || me.username || '')
    setEmail((v) => v || me.email || '')
    setPhotoUrl((v) => v || me.avatar_url || '')
    if (me.university || me.major) {
      setEducation((v) =>
        v.length
          ? v
          : [{ ...EMPTY_EDUCATION, institution: me.university ?? '', field: me.major ?? '' }],
      )
    }
  }

  const matchedCount = requiredSkills.filter((s) =>
    skills.some((x) => x.toLowerCase() === s.toLowerCase()),
  ).length
  const matchPct = requiredSkills.length ? Math.round((matchedCount / requiredSkills.length) * 100) : null

  const addSkill = (raw: string) => {
    const value = raw.trim()
    if (!value) return
    setSkills((prev) =>
      prev.some((x) => x.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value],
    )
    setSkillDraft('')
  }
  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(skillDraft)
    }
  }

  const onPhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('الصورة الشخصية يجب أن تكون صورة (JPEG/PNG/WebP).')
      return
    }
    setError('')
    setUploadingPhoto(true)
    try {
      const res = await uploadFile(file)
      setPhotoUrl(res.url)
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذّر رفع الصورة.'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  const onCvChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('السيرة الذاتية يجب أن تكون ملف PDF.')
      return
    }
    setError('')
    setUploadingCv(true)
    try {
      const res = await uploadFile(file)
      setResumeUrl(res.url)
      setResumeName(file.name)
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذّر رفع السيرة الذاتية.'))
    } finally {
      setUploadingCv(false)
    }
  }

  const submit = () => {
    if (!fullName.trim() || !email.trim()) {
      setError('الاسم الكامل والبريد الإلكتروني مطلوبان.')
      return
    }
    setError('')
    apply.mutate(
      {
        full_name: fullName.trim(),
        headline: headline.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        photo_url: photoUrl,
        cover_letter: coverLetter.trim(),
        resume_url: resumeUrl,
        portfolio_url: portfolioUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
        skills,
        education: education.filter((e) => e.degree || e.field || e.institution),
        experience: experience.filter((x) => x.title || x.company || x.description),
      },
      {
        onSuccess: () => setDone(true),
        onError: (e: unknown) => setError(getApiErrorMessage(e, 'تعذّر إرسال الطلب.')),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-dark bg-gray-light">
        {done ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent" />
            <h3 className="mt-4 text-xl font-bold text-text">تم إرسال طلبك!</h3>
            <p className="mt-1 text-sm text-text-secondary">
              وصل طلبك إلى {companyName} وسيظهر في لوحة المتقدّمين لديهم.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-bg hover:bg-accent-hover"
            >
              تم
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-dark p-5">
              <div>
                <h3 className="text-lg font-bold text-text">التقديم على: {job.title}</h3>
                <p className="mt-0.5 text-sm text-text-secondary">{companyName}</p>
              </div>
              <button onClick={onClose} className="text-text-secondary hover:text-accent">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Photo + identity */}
              <Section icon={<Camera className="h-4 w-4" />} title="الملف الشخصي">
                <div className="flex items-center gap-4">
                  <label className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full border border-gray-dark bg-bg">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="الصورة الشخصية" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-text-secondary">
                        <Camera className="h-6 w-6" />
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                      {uploadingPhoto ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <Camera className="h-5 w-5 text-white" />
                      )}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
                  </label>
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <Field label="الاسم الكامل *">
                      <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="المسمّى المهني">
                      <input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="مطوّر واجهات أمامية"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="البريد الإلكتروني *">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className={inputClass} />
                  </Field>
                  <Field label="رقم الهاتف">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className={inputClass} />
                  </Field>
                  <Field label="الموقع">
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="عمّان، الأردن"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>

              {/* Skills with live match against the job's required skills */}
              <Section icon={<Sparkles className="h-4 w-4" />} title="المهارات">
                {requiredSkills.length > 0 && (
                  <div className="rounded-lg border border-gray-dark bg-bg/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-text-secondary">المهارات المطلوبة للوظيفة</span>
                      {matchPct !== null && (
                        <span className="text-xs font-semibold text-accent">
                          مطابقة {matchPct}% ({matchedCount}/{requiredSkills.length})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.map((s) => {
                        const have = skills.some((x) => x.toLowerCase() === s.toLowerCase())
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => (have ? null : addSkill(s))}
                            className={`rounded-full px-3 py-1 text-xs transition ${
                              have
                                ? 'bg-accent/20 text-accent'
                                : 'border border-gray-dark text-text-secondary hover:border-accent hover:text-accent'
                            }`}
                          >
                            {have ? '✓ ' : '+ '}
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent"
                    >
                      {s}
                      <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={onSkillKey}
                  onBlur={() => addSkill(skillDraft)}
                  placeholder="أضف مهارة ثم اضغط Enter"
                  className={inputClass}
                />
              </Section>

              {/* Education */}
              <Section icon={<GraduationCap className="h-4 w-4" />} title="التعليم">
                {education.map((entry, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-gray-dark bg-bg/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">مؤهل #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setEducation((p) => p.filter((_, idx) => idx !== i))}
                        className="text-text-secondary hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={entry.degree}
                        onChange={(e) =>
                          setEducation((p) => p.map((x, idx) => (idx === i ? { ...x, degree: e.target.value } : x)))
                        }
                        placeholder="الدرجة (بكالوريوس...)"
                        className={inputClass}
                      />
                      <input
                        value={entry.field}
                        onChange={(e) =>
                          setEducation((p) => p.map((x, idx) => (idx === i ? { ...x, field: e.target.value } : x)))
                        }
                        placeholder="التخصص"
                        className={inputClass}
                      />
                      <input
                        value={entry.institution}
                        onChange={(e) =>
                          setEducation((p) =>
                            p.map((x, idx) => (idx === i ? { ...x, institution: e.target.value } : x)),
                          )
                        }
                        placeholder="الجامعة / المؤسسة"
                        className={`${inputClass} sm:col-span-2`}
                      />
                      <input
                        value={entry.start_year}
                        onChange={(e) =>
                          setEducation((p) =>
                            p.map((x, idx) => (idx === i ? { ...x, start_year: e.target.value } : x)),
                          )
                        }
                        placeholder="سنة البدء"
                        dir="ltr"
                        className={inputClass}
                      />
                      <input
                        value={entry.end_year}
                        onChange={(e) =>
                          setEducation((p) => p.map((x, idx) => (idx === i ? { ...x, end_year: e.target.value } : x)))
                        }
                        placeholder="سنة التخرّج"
                        dir="ltr"
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEducation((p) => [...p, { ...EMPTY_EDUCATION }])}
                  className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
                >
                  <Plus className="h-4 w-4" /> إضافة مؤهل
                </button>
              </Section>

              {/* Experience */}
              <Section icon={<Briefcase className="h-4 w-4" />} title="الخبرات السابقة">
                {experience.map((entry, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-gray-dark bg-bg/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">خبرة #{i + 1}</span>
                      <button
                        type="button"
                        onClick={() => setExperience((p) => p.filter((_, idx) => idx !== i))}
                        className="text-text-secondary hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={entry.title}
                        onChange={(e) =>
                          setExperience((p) => p.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                        }
                        placeholder="المسمّى الوظيفي"
                        className={inputClass}
                      />
                      <input
                        value={entry.company}
                        onChange={(e) =>
                          setExperience((p) => p.map((x, idx) => (idx === i ? { ...x, company: e.target.value } : x)))
                        }
                        placeholder="الشركة"
                        className={inputClass}
                      />
                      <input
                        value={entry.start}
                        onChange={(e) =>
                          setExperience((p) => p.map((x, idx) => (idx === i ? { ...x, start: e.target.value } : x)))
                        }
                        placeholder="من (2022)"
                        dir="ltr"
                        className={inputClass}
                      />
                      <input
                        value={entry.end}
                        onChange={(e) =>
                          setExperience((p) => p.map((x, idx) => (idx === i ? { ...x, end: e.target.value } : x)))
                        }
                        placeholder="إلى (2024 / حتى الآن)"
                        dir="ltr"
                        className={inputClass}
                      />
                    </div>
                    <textarea
                      value={entry.description}
                      onChange={(e) =>
                        setExperience((p) => p.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))
                      }
                      rows={2}
                      placeholder="وصف موجز للمسؤوليات والإنجازات"
                      className={inputClass}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setExperience((p) => [...p, { ...EMPTY_EXPERIENCE }])}
                  className="flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
                >
                  <Plus className="h-4 w-4" /> إضافة خبرة
                </button>
              </Section>

              {/* CV + links */}
              <Section icon={<FileText className="h-4 w-4" />} title="السيرة الذاتية والروابط">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border border-dashed border-gray-dark bg-bg/50 px-4 py-3 text-sm hover:border-accent">
                  <span className="flex items-center gap-2 text-text-secondary">
                    <FileText className="h-4 w-4" />
                    {resumeName || (resumeUrl ? 'تم رفع السيرة الذاتية' : 'ارفع السيرة الذاتية (PDF)')}
                  </span>
                  {uploadingCv ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  ) : resumeUrl ? (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  ) : (
                    <Plus className="h-4 w-4 text-accent" />
                  )}
                  <input type="file" accept="application/pdf" className="hidden" onChange={onCvChange} />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="رابط المعرض / الأعمال">
                    <input
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      dir="ltr"
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </Field>
                  <Field label="LinkedIn">
                    <input
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      dir="ltr"
                      placeholder="https://linkedin.com/in/..."
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>

              {/* Cover letter */}
              <Section icon={<Send className="h-4 w-4" />} title="رسالة التقديم">
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="لماذا أنت مناسب لهذه الوظيفة؟"
                  className={inputClass}
                />
              </Section>
            </div>

            {/* Sticky footer */}
            <div className="border-t border-gray-dark p-5">
              {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
              <button
                onClick={submit}
                disabled={apply.isPending || uploadingPhoto || uploadingCv}
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
