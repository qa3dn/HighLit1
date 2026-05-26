import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addProjectFile,
  addProjectUpdate,
  createProject,
  deleteProject,
  deleteProjectFile,
  getProject,
  listMyProjects,
  updateProject,
  updateProjectFile,
  type CreateProjectPayload,
} from '@/lib/api/codeProjects'

export function useMyProjects() {
  return useQuery({
    queryKey: ['my-projects'],
    queryFn: listMyProjects,
  })
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => getProject(slug!),
    enabled: !!slug,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-projects'] }),
  })
}

export function useUpdateProject(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<CreateProjectPayload>) => updateProject(slug, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', slug] })
      qc.invalidateQueries({ queryKey: ['my-projects'] })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => deleteProject(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-projects'] }),
  })
}

export function useAddFile(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      addProjectFile(slug, path, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', slug] }),
  })
}

export function useUpdateFile(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ fileId, content }: { fileId: number; content: string }) =>
      updateProjectFile(slug, fileId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', slug] }),
  })
}

export function useDeleteFile(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fileId: number) => deleteProjectFile(slug, fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', slug] }),
  })
}

export function useAddUpdate(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (message: string) => addProjectUpdate(slug, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', slug] }),
  })
}
