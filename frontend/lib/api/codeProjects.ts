import { api } from '../api'

export type ProjectVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE'

export interface ProjectAuthor {
  id: number
  username: string
  avatar_url: string
}

export interface ProjectFile {
  id: number
  path: string
  content: string
  updated_at: string
}

export interface ProjectUpdate {
  id: number
  message: string
  created_at: string
}

export interface CodeProjectSummary {
  id: number
  owner_id: number
  author: ProjectAuthor
  name: string
  slug: string
  description: string
  language: string
  tags: string[]
  visibility: ProjectVisibility
  github_url: string
  linked_post: number | null
  file_count: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface CodeProjectDetail extends CodeProjectSummary {
  readme: string
  files: ProjectFile[]
  updates: ProjectUpdate[]
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CreateProjectPayload {
  name: string
  description?: string
  language?: string
  tags?: string[]
  readme?: string
  visibility?: ProjectVisibility
  github_url?: string
  linked_post?: number | null
}

export async function listMyProjects() {
  const { data } = await api.get<CodeProjectSummary[]>('/code-projects/mine')
  return data
}

export async function listPublicProjects(params: { user_id?: number; q?: string } = {}) {
  const { data } = await api.get<Paginated<CodeProjectSummary>>('/code-projects', { params })
  return data
}

export async function getProject(slug: string) {
  const { data } = await api.get<CodeProjectDetail>(`/code-projects/${slug}`)
  return data
}

export async function createProject(payload: CreateProjectPayload) {
  const { data } = await api.post<CodeProjectDetail>('/code-projects', payload)
  return data
}

export async function updateProject(slug: string, payload: Partial<CreateProjectPayload>) {
  const { data } = await api.patch<CodeProjectDetail>(`/code-projects/${slug}`, payload)
  return data
}

export async function deleteProject(slug: string) {
  await api.delete(`/code-projects/${slug}`)
}

export async function addProjectFile(slug: string, path: string, content: string) {
  const { data } = await api.post<ProjectFile>(`/code-projects/${slug}/files`, { path, content })
  return data
}

export async function updateProjectFile(slug: string, fileId: number, content: string) {
  const { data } = await api.patch<ProjectFile>(`/code-projects/${slug}/files/${fileId}`, { content })
  return data
}

export async function deleteProjectFile(slug: string, fileId: number) {
  await api.delete(`/code-projects/${slug}/files/${fileId}`)
}

export async function addProjectUpdate(slug: string, message: string) {
  const { data } = await api.post<ProjectUpdate>(`/code-projects/${slug}/updates`, { message })
  return data
}

export async function downloadProject(slug: string) {
  // Use the axios client so the auth header is sent (needed for private projects),
  // then trigger a browser download from the returned blob.
  const res = await api.get(`/code-projects/${slug}/download`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slug}.zip`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
