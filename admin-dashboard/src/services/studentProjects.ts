import client from './client';

export type ProjectStatus = 'PUBLISHED' | 'HIDDEN' | 'REJECTED';
export type ProjectType = 'IMAGE' | 'GITHUB' | 'VIDEO' | 'MIXED';

export interface StudentProject {
  id: number;
  user_id: number;
  author: {
    id: number;
    username: string;
    university?: string;
    major?: string;
  };
  title: string;
  summary: string;
  university: string;
  major: string;
  academic_year: string;
  project_type: ProjectType;
  status: ProjectStatus;
  rejection_reason?: string;
  cover_image: string;
  created_at: string;
}

export interface ProjectFilters {
  university?: string;
  major?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
  q?: string;
}

export async function listProjects(filters: ProjectFilters = {}) {
  const { data } = await client.get<StudentProject[]>('/student-projects', { params: filters });
  return data;
}

export async function listMyProjects() {
  const { data } = await client.get<StudentProject[]>('/student-projects/mine');
  return data;
}

export async function hideProject(id: number) {
  const { data } = await client.post<StudentProject>(`/student-projects/${id}/hide`);
  return data;
}

export async function rejectProject(id: number, reason?: string) {
  const { data } = await client.post<StudentProject>(`/student-projects/${id}/reject`, {
    reason: reason || '',
  });
  return data;
}
