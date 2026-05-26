import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteJob,
  getApplicants,
  listJobs,
  setJobFeatured,
  type JobFilters,
} from './jobService';

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: ['admin-jobs', filters],
    queryFn: () => listJobs(filters),
  });
}

export function useSetJobFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) => setJobFeatured(id, isFeatured),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-jobs'] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-jobs'] }),
  });
}

export function useApplicants(jobId: number | null) {
  return useQuery({
    queryKey: ['admin-job-applicants', jobId],
    queryFn: () => getApplicants(jobId!),
    enabled: jobId !== null,
  });
}
