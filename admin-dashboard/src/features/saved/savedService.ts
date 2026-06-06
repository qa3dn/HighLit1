import client from '../../services/client';

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

// NOTE: `client` already has baseURL `.../api/v1`, so paths here are relative to it.
export const savedService = {
  getSavedJobs: ()           => client.get<SavedJob[]>('/saved/'),
  unsaveJob:    (id: number) => client.delete(`/saved/${id}/`),
};
