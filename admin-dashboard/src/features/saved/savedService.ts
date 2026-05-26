import api from '../../services/api';

export interface SavedJob {
  id: number;
  job_id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  min_salary: number;
  max_salary: number;
  saved_at: string;
}

export const savedService = {
  getSavedJobs: ()          => api.get<SavedJob[]>('/api/v1/saved/'),
  unsaveJob:    (id: number) => api.delete(`/api/v1/saved/${id}/`),
};
