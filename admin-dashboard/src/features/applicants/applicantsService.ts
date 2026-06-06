import client from '../../services/client';

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';

export interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  start_year: string;
  end_year: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

export interface Applicant {
  id: number;
  applicant: {
    id: number;
    username: string;
    avatar_url?: string;
    rank?: string;
    email?: string;
    github_username?: string;
    university?: string;
    major?: string;
  };
  full_name: string;
  headline: string;
  email?: string;
  phone?: string;
  location: string;
  photo_url: string;
  cover_letter: string;
  resume_url: string;
  portfolio_url: string;
  linkedin_url: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  skill_match: number | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface ApplicantsResponse {
  results: Applicant[];
  total: number;
  visible: number;
  locked_count: number;
  limit: number | null;
  plan: { tier: string; name: string; can_view_applicant_contact: boolean } | null;
  is_admin: boolean;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  application_count?: number;
}

/** Coerce an applicant payload to a complete shape so a missing array (during a
 * deploy, or from a not-yet-reloaded API) degrades gracefully instead of
 * crashing the render. */
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
  };
}

// `client` already has baseURL `.../api/v1`, so paths here are relative to it.
export const applicantsService = {
  getJobs: () => client.get<Job[] | { results: Job[] }>('/jobs'),

  getJobApplicants: (jobId: number) =>
    client.get<ApplicantsResponse>(`/jobs/${jobId}/applicants`),

  updateApplicationStatus: (applicationId: number, status: ApplicationStatus) =>
    client.patch<Applicant>(`/jobs/applications/${applicationId}`, { status }),
};
