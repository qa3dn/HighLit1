'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProject,
  deleteProject,
  getFacets,
  getProject,
  hideProject,
  listMyProjects,
  listProjects,
  rejectProject,
  updateProject,
  type CreateProjectPayload,
  type ProjectFilters,
} from '@/lib/api/studentProjects'

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['student-projects', filters],
    queryFn: () => listProjects(filters),
  })
}

export function useProject(id: number | string | undefined) {
  return useQuery({
    queryKey: ['student-project', id],
    queryFn: () => getProject(id!),
    enabled: id !== undefined && id !== '',
  })
}

export function useMyProjects() {
  return useQuery({
    queryKey: ['student-projects-mine'],
    queryFn: listMyProjects,
  })
}

export function useProjectFacets() {
  return useQuery({
    queryKey: ['student-projects-facets'],
    queryFn: getFacets,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-projects'] })
      queryClient.invalidateQueries({ queryKey: ['student-projects-mine'] })
      queryClient.invalidateQueries({ queryKey: ['student-projects-facets'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateProjectPayload> }) =>
      updateProject(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['student-projects'] })
      queryClient.invalidateQueries({ queryKey: ['student-project', id] })
      queryClient.invalidateQueries({ queryKey: ['student-projects-mine'] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-projects'] })
      queryClient.invalidateQueries({ queryKey: ['student-projects-mine'] })
    },
  })
}

export function useHideProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => hideProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-projects'] })
    },
  })
}

export function useRejectProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => rejectProject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-projects'] })
    },
  })
}
