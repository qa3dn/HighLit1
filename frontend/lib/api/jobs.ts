import { api } from '@/lib/api'

export type JobType = 'PAID' | 'INTERNSHIP' | 'FREELANCE'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY'
export type Workplace = 'ONSITE' | 'REMOTE' | 'HYBRID'
export type Experience = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD'

export interface JobCompany {
  id: number
  name: string
  slug: string
  logo_url: string
  is_verified: boolean
}

export interface Job {
  id: number
  title: string
  company: string
  company_profile: number | null
  company_detail: JobCompany | null
  location: string
  description: string
  min_salary: number
  max_salary: number
  currency: string
  job_type: JobType
  employment_type: EmploymentType
  workplace_type: Workplace
  experience_level: Experience
  skills: string[]
  status: string
  is_featured: boolean
  application_deadline: string | null
  application_count: number
  has_applied: boolean
  created_by: number
  created_at: string
  updated_at: string
}

export interface JobFilters {
  type?: JobType | ''
  q?: string
  location?: string
  workplace?: Workplace | ''
  experience?: Experience | ''
}

export interface EducationEntry {
  degree: string
  field: string
  institution: string
  start_year: string
  end_year: string
}

export interface ExperienceEntry {
  title: string
  company: string
  start: string
  end: string
  description: string
}

export interface ApplyPayload {
  full_name?: string
  headline?: string
  email?: string
  phone?: string
  location?: string
  photo_url?: string
  cover_letter?: string
  resume_url?: string
  portfolio_url?: string
  linkedin_url?: string
  education?: EducationEntry[]
  experience?: ExperienceEntry[]
  skills?: string[]
}

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED'

export interface JobApplication {
  id: number
  job: number
  job_detail: { id: number; title: string; company: string }
  full_name: string
  headline: string
  email: string
  phone: string
  location: string
  photo_url: string
  cover_letter: string
  resume_url: string
  portfolio_url: string
  linkedin_url: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: string[]
  status: ApplicationStatus
  created_at: string
}

export interface JobInput {
  title: string
  description: string
  location?: string
  min_salary?: number
  max_salary?: number
  currency?: string
  job_type?: JobType
  employment_type?: EmploymentType
  workplace_type?: Workplace
  experience_level?: Experience
  skills?: string[]
  application_deadline?: string | null
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  company_slug?: string
}

export interface Applicant {
  id: number
  applicant: {
    id: number
    username: string
    avatar_url?: string
    rank?: string
    email?: string
    github_username?: string
    university?: string
    major?: string
  }
  full_name: string
  headline: string
  email?: string
  phone?: string
  location: string
  photo_url: string
  cover_letter: string
  resume_url: string
  portfolio_url: string
  linkedin_url: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  skill_match: number | null
  status: ApplicationStatus
  created_at: string
}

export interface ApplicantsResponse {
  results: Applicant[]
  total: number
  visible: number
  locked_count: number
  limit: number | null
  plan: { tier: string; name: string; can_view_applicant_contact: boolean } | null
  is_admin: boolean
}

function clean(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  )
}

export async function listJobs(filters: JobFilters = {}): Promise<Job[]> {
  const { data } = await api.get('/jobs', { params: clean(filters as Record<string, unknown>) })
  // The list endpoint returns a bare array; tolerate a paginated shape too.
  return Array.isArray(data) ? data : (data.results ?? [])
}

export async function getJob(id: number | string): Promise<Job> {
  const { data } = await api.get(`/jobs/${id}`)
  return data
}

export async function applyToJob(id: number | string, payload: ApplyPayload): Promise<JobApplication> {
  const { data } = await api.post(`/jobs/${id}/apply`, payload)
  return data
}

export async function getMyApplications(): Promise<JobApplication[]> {
  const { data } = await api.get('/jobs/my-applications')
  return Array.isArray(data) ? data : (data.results ?? [])
}

export async function getCompanyJobs(slug: string): Promise<Job[]> {
  const { data } = await api.get(`/companies/${slug}/jobs`)
  return Array.isArray(data) ? data : (data.results ?? [])
}

// --- Company-side (manager) ---

export async function listMyJobs(): Promise<Job[]> {
  const { data } = await api.get('/jobs/mine')
  return Array.isArray(data) ? data : (data.results ?? [])
}

export async function createJob(payload: JobInput): Promise<Job> {
  const { data } = await api.post('/jobs', payload)
  return data
}

export async function updateJob(id: number | string, payload: Partial<JobInput>): Promise<Job> {
  const { data } = await api.patch(`/jobs/${id}`, payload)
  return data
}

export async function deleteJob(id: number | string): Promise<void> {
  await api.delete(`/jobs/${id}`)
}

/** Coerce an applicant payload to a complete shape. The backend always returns
 * these fields, but during a deploy the API and client can briefly disagree (or
 * an old response may sit in the query cache); defaulting here keeps the UI from
 * crashing on a missing array rather than masking a logic bug. */
export function normalizeApplicant(raw: Applicant): Applicant {
  return {
    ...raw,
    full_name: raw.full_name ?? '',
    headline: raw.headline ?? '',
    location: raw.location ?? '',
    photo_url: raw.photo_url ?? '',
    cover_letter: raw.cover_letter ?? '',
    resume_url: raw.resume_url ?? '',
    portfolio_url: raw.portfolio_url ?? '',
    linkedin_url: raw.linkedin_url ?? '',
    skills: raw.skills ?? [],
    matched_skills: raw.matched_skills ?? [],
    missing_skills: raw.missing_skills ?? [],
    education: raw.education ?? [],
    experience: raw.experience ?? [],
    skill_match: raw.skill_match ?? null,
  }
}

export async function getApplicants(jobId: number | string): Promise<ApplicantsResponse> {
  const { data } = await api.get(`/jobs/${jobId}/applicants`)
  return { ...data, results: (data.results ?? []).map(normalizeApplicant) }
}

export async function updateApplicationStatus(
  appId: number | string,
  status: ApplicationStatus,
): Promise<Applicant> {
  const { data } = await api.patch(`/jobs/applications/${appId}`, { status })
  return normalizeApplicant(data)
}
