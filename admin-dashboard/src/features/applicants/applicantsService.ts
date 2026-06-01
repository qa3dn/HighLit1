import client from '../../services/client';

export interface Applicant {
  id: number;
  job: number;
  job_title: string;
  applicant_id: number;
  applicant_name: string;
  applicant_email: string;
  cover_letter: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  applied_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
}

// NOTE: `client` already has baseURL `.../api/v1`, so paths here are relative to it.
export const applicantsService = {
  getMyJobs: () =>
    client.get<Job[]>('/jobs/'),

  getJobApplicants: (jobId: number) =>
    client.get<Applicant[]>(`/jobs/${jobId}/applicants`),

  updateApplicationStatus: (jobId: number, applicationId: number, status: Applicant['status']) =>
    client.patch<Applicant>(`/jobs/${jobId}/applicants/${applicationId}`, { status }),
};
