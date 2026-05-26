import api from '../../services/api';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  min_salary: number;
  max_salary: number;
  created_by: number;
  created_at: string;
}

export interface CreateJobPayload {
  title: string;
  company: string;
  location: string;
  description: string;
  min_salary: number;
  max_salary: number;
}

export const jobsService = {
  getJobs: () =>
    api.get<Job[]>('/api/v1/jobs/'),

  createJob: (payload: CreateJobPayload) =>
    api.post<Job>('/api/v1/jobs/', payload),

  deleteJob: (id: number) =>
    api.delete(`/api/v1/jobs/${id}`),
};
