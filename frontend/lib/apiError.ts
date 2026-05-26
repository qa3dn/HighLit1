import { AxiosError } from 'axios'

// Maps backend field names to Arabic labels for readable error messages.
const FIELD_LABELS: Record<string, string> = {
  title: 'العنوان',
  description: 'الوصف',
  resume_url: 'رابط السيرة الذاتية',
  cover_letter: 'رسالة التقديم',
  name: 'الاسم',
  skills: 'المهارات',
  min_salary: 'الحد الأدنى للراتب',
  max_salary: 'الحد الأقصى للراتب',
  application_deadline: 'آخر موعد للتقديم',
  logo_url: 'رابط الشعار',
  banner_url: 'رابط الغلاف',
  website: 'الموقع الإلكتروني',
  plan_id: 'الباقة',
}

/**
 * Turn an axios error into a human-readable Arabic message. Handles DRF's two
 * shapes: a single `{detail: "..."}` and field errors `{field: ["..."], ...}`.
 */
export function getApiErrorMessage(error: unknown, fallback = 'حدث خطأ، حاول مجدداً.'): string {
  const data = (error as AxiosError<Record<string, unknown> | string>)?.response?.data
  if (!data) {
    return fallback
  }
  if (typeof data === 'string') {
    return data
  }
  if (typeof data.detail === 'string') {
    return data.detail
  }
  const parts: string[] = []
  for (const [key, value] of Object.entries(data)) {
    if (key === 'request_id') {
      continue
    }
    const message = Array.isArray(value) ? value.join('، ') : String(value)
    if (key === 'non_field_errors' || key === 'detail') {
      parts.push(message)
    } else {
      parts.push(`${FIELD_LABELS[key] ?? key}: ${message}`)
    }
  }
  return parts.length ? parts.join(' — ') : fallback
}
