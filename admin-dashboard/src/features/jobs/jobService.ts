import client from '../../services/client';

export interface AdminJobCompany {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  is_verified: boolean;
}

export interface AdminJob {
  id: number;
  title: string;
  company: string;
  company_detail: AdminJobCompany | null;
  location: string;
  min_salary: number;
  max_salary: number;
  currency: string;
  job_type: string;
  employment_type: string;
  workplace_type: string;
  experience_level: string;
  status: string;
  is_featured: boolean;
  application_count: number;
  created_at: string;
}

export interface JobFilters {
  q?: string;
  status?: string;
  type?: string;
  featured?: string;
}

export interface Paginated<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface AdminApplicant {
  id: number;
  applicant: {
    id: number;
    username: string;
    email?: string;
    rank?: string;
    github_username?: string;
    university?: string;
    major?: string;
  };
  cover_letter: string;
  resume_url: string;
  status: string;
  created_at: string;
}

export interface ApplicantsResponse {
  results: AdminApplicant[];
  total: number;
  visible: number;
  locked_count: number;
  limit: number | null;
  is_admin: boolean;
}

function clean(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  );
}

export async function listJobs(filters: JobFilters) {
  const { data } = await client.get<Paginated<AdminJob>>('/moderation/jobs', {
    params: clean(filters as Record<string, unknown>),
  });
  return data;
}

export async function setJobFeatured(id: number, isFeatured: boolean) {
  const { data } = await client.post<{ id: number; is_featured: boolean }>(
    `/moderation/jobs/${id}/feature`,
    { is_featured: isFeatured },
  );
  return data;
}

export async function deleteJob(id: number) {
  await client.delete(`/jobs/${id}`);
}

export async function getApplicants(jobId: number) {
  const { data } = await client.get<ApplicantsResponse>(`/jobs/${jobId}/applicants`);
  return data;
}
