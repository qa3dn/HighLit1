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

export interface DeadlineInfo {
  label: string
  urgent: boolean
  closed: boolean
}

/** Human deadline label + urgency. Urgent within a week; closed once past. */
export function formatDeadline(deadline: string | null): DeadlineInfo | null {
  if (!deadline) {
    return null
  }
  const end = new Date(deadline)
  if (Number.isNaN(end.getTime())) {
    return null
  }
  const days = Math.ceil((end.getTime() - Date.now()) / 86_400_000)
  if (days < 0) {
    return { label: 'انتهى التقديم', urgent: false, closed: true }
  }
  if (days === 0) {
    return { label: 'يغلق اليوم', urgent: true, closed: false }
  }
  if (days === 1) {
    return { label: 'يغلق غداً', urgent: true, closed: false }
  }
  if (days <= 7) {
    return { label: `يغلق خلال ${days} أيام`, urgent: true, closed: false }
  }
  return { label: `التقديم حتى ${end.toLocaleDateString('ar')}`, urgent: false, closed: false }
}
