import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  applyToJob,
  createJob,
  deleteJob,
  getApplicants,
  getCompanyJobs,
  getJob,
  getMyApplications,
  listJobs,
  listMyJobs,
  updateApplicationStatus,
  updateJob,
  type ApplicationStatus,
  type ApplyPayload,
  type JobFilters,
  type JobInput,
} from '@/lib/api/jobs'

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => listJobs(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

export function useJob(id: number | string | undefined) {
  return useQuery({
    queryKey: ['job', String(id)],
    queryFn: () => getJob(id!),
    enabled: id !== undefined && id !== '' && id !== 'undefined',
  })
}

export function useMyApplications(enabled = true) {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: getMyApplications,
    enabled,
  })
}

export function useCompanyJobs(slug: string | undefined) {
  return useQuery({
    queryKey: ['company-jobs', slug],
    queryFn: () => getCompanyJobs(slug!),
    enabled: !!slug,
  })
}

export function useApplyToJob(id: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ApplyPayload) => applyToJob(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', String(id)] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
  })
}

// --- Company-side ---

export function useMyJobs(enabled = true) {
  return useQuery({ queryKey: ['my-jobs'], queryFn: listMyJobs, enabled })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: JobInput) => createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<JobInput> }) => updateJob(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    },
  })
}

export function useApplicants(jobId: number | string | undefined) {
  return useQuery({
    queryKey: ['applicants', String(jobId)],
    queryFn: () => getApplicants(jobId!),
    enabled: jobId !== undefined && jobId !== '' && jobId !== 'undefined',
  })
}

export function useUpdateApplicationStatus(jobId: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: ApplicationStatus }) =>
      updateApplicationStatus(appId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applicants', String(jobId)] }),
  })
}
