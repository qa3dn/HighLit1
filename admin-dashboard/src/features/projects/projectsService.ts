import api from '../../services/api';

export type ProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  status: ProjectStatus;
  github_url: string;
  live_url: string;
  created_at: string;
}

export interface CreateProjectPayload {
  title: string;
  description: string;
  tech_stack: string[];
  status: ProjectStatus;
  github_url?: string;
  live_url?: string;
}

export const projectsService = {
  getProjects:   ()                        => api.get<Project[]>('/api/v1/projects/'),
  createProject: (p: CreateProjectPayload) => api.post<Project>('/api/v1/projects/', p),
  deleteProject: (id: number)              => api.delete(`/api/v1/projects/${id}/`),
};
