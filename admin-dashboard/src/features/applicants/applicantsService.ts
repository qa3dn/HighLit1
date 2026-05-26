import api from '../../services/api';

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

export const applicantsService = {
  getMyJobs: () =>
    api.get<Job[]>('/api/v1/jobs/'),

  getJobApplicants: (jobId: number) =>
    api.get<Applicant[]>(`/api/v1/jobs/${jobId}/applicants`),

  updateApplicationStatus: (jobId: number, applicationId: number, status: Applicant['status']) =>
    api.patch<Applicant>(`/api/v1/jobs/${jobId}/applicants/${applicationId}`, { status }),
};
