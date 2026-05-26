import api from '../../services/api';
import type { Job } from '../applicants/applicantsService';
import type { Applicant } from '../applicants/applicantsService';

export interface CompanyDashboardData {
  jobs: (Job & { applicant_count: number })[];
  recentApplicants: Applicant[];
  stats: {
    totalJobs: number;
    totalApplicants: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export const dashboardService = {
  getMyJobs: () =>
    api.get<Job[]>('/api/v1/jobs/'),

  getJobApplicants: (jobId: number) =>
    api.get<Applicant[]>(`/api/v1/jobs/${jobId}/applicants`),
};
