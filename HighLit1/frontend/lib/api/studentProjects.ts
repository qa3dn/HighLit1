import { api } from '../api'

export type ProjectType = 'IMAGE' | 'GITHUB' | 'VIDEO' | 'MIXED'
export type ProjectStatus = 'PUBLISHED' | 'HIDDEN' | 'REJECTED'

export interface ProjectAuthor {
  id: number
  username: string
  avatar_url?: string
  university?: string
  major?: string
}

export interface StudentProject {
  id: number
  user_id: number
  author: ProjectAuthor
  title: string
  summary: string
  description: string
  university: string
  major: string
  academic_year: string
  project_type: ProjectType
  github_url: string
  demo_url: string
  video_url: string
  cover_image: string
  gallery_images: string[]
  tech_stack: string[]
  tags: string[]
  status: ProjectStatus
  rejection_reason?: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface ProjectFilters {
  university?: string
  major?: string
  year?: string
  project_type?: ProjectType
  q?: string
  ordering?: string
  status?: ProjectStatus
}

export interface CreateProjectPayload {
  title: string
  summary: string
  description?: string
  university: string
  major: string
  academic_year?: string
  project_type: ProjectType
  github_url?: string
  demo_url?: string
  video_url?: string
  cover_image?: string
  gallery_images?: string[]
  tech_stack?: string[]
  tags?: string[]
}

export async function listProjects(filters: ProjectFilters = {}) {
  const { data } = await api.get<StudentProject[]>('/student-projects', { params: filters })
  return data
}

export async function getProject(id: number | string) {
  const { data } = await api.get<StudentProject>(`/student-projects/${id}`)
  return data
}

export async function listMyProjects() {
  const { data } = await api.get<StudentProject[]>('/student-projects/mine')
  return data
}

export async function getFacets() {
  const { data } = await api.get<{ universities: string[]; majors: string[] }>(
    '/student-projects/facets',
  )
  return data
}

export async function createProject(payload: CreateProjectPayload) {
  const { data } = await api.post<StudentProject>('/student-projects', payload)
  return data
}

export async function updateProject(id: number, payload: Partial<CreateProjectPayload>) {
  const { data } = await api.patch<StudentProject>(`/student-projects/${id}`, payload)
  return data
}

export async function deleteProject(id: number) {
  await api.delete(`/student-projects/${id}`)
}

export async function hideProject(id: number) {
  const { data } = await api.post<StudentProject>(`/student-projects/${id}/hide`)
  return data
}

export async function rejectProject(id: number, reason?: string) {
  const { data } = await api.post<StudentProject>(`/student-projects/${id}/reject`, {
    reason: reason || '',
  })
  return data
}

export async function uploadProjectImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<{ url: string; filename: string; content_type: string }>(
    '/uploads/file',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}
