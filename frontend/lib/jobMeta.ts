import type { JobType, Workplace, Experience, EmploymentType } from '@/lib/api/jobs'

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  PAID: 'مدفوعة',
  INTERNSHIP: 'تدريب',
  FREELANCE: 'عمل حر',
}

export const WORKPLACE_LABEL: Record<Workplace, string> = {
  ONSITE: 'من المقر',
  REMOTE: 'عن بُعد',
  HYBRID: 'هجين',
}

export const EXPERIENCE_LABEL: Record<Experience, string> = {
  ENTRY: 'مبتدئ',
  MID: 'متوسط',
  SENIOR: 'خبير',
  LEAD: 'قيادي',
}

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  FULL_TIME: 'دوام كامل',
  PART_TIME: 'دوام جزئي',
  CONTRACT: 'عقد',
  TEMPORARY: 'مؤقت',
}

export function formatSalary(min: number, max: number, currency: string): string | null {
  if (!min && !max) {
    return null
  }
  const c = currency || 'JOD'
  if (min && max) {
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${c}`
  }
  if (min) {
    return `من ${min.toLocaleString()} ${c}`
  }
  return `حتى ${max.toLocaleString()} ${c}`
}
