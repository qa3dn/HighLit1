import { api } from '../api'
import type { Post } from './posts'
import type { CodeProjectSummary } from './codeProjects'

export interface PublicProfile {
  id: number
  username: string
  bio: string
  avatar_url: string
  banner_url: string
  rank: string
  reputation_points: number
  status_text: string
  university: string
  major: string
  github_username: string
  member_since: string
}

export interface GithubRepo {
  name: string
  description: string
  language: string
  stars: number
  forks: number
  url: string
  updated_at: string
}

export interface ProfileActivity {
  posts: number
  code: number
  ideas: number
  reactions_received: number
}

export interface ProfileCodeItem {
  id: number
  title: string
  language: string
  description?: string
  visibility: string
  tags?: string[]
  created_at: string
}

export interface ProfileIdeaItem {
  id: number
  title: string
  description?: string
  status: string
  created_at: string
}

export interface ProfileVisibility {
  profile_visibility: 'PUBLIC' | 'PRIVATE'
  show_posts: boolean
  show_code: boolean
  show_ideas: boolean
  show_activity: boolean
}

export interface PublicProfileResponse {
  // Full payload (public or owner view)
  profile?: PublicProfile
  is_private: boolean
  is_owner: boolean
  visibility?: ProfileVisibility
  activity?: ProfileActivity | null
  posts?: Post[]
  code?: ProfileCodeItem[]
  projects?: CodeProjectSummary[]
  ideas?: ProfileIdeaItem[]
  github_repos?: GithubRepo[]
  // Minimal payload when the profile is private and the viewer isn't the owner
  id?: number
  username?: string
  avatar_url?: string
}

export async function getPublicProfile(userId: number | string): Promise<PublicProfileResponse> {
  const { data } = await api.get<PublicProfileResponse>(`/profiles/${userId}`)
  return data
}

export async function getGithubRepos(username: string): Promise<GithubRepo[]> {
  const { data } = await api.get<{ repos: GithubRepo[] }>('/profiles/github-repos', {
    params: { username },
  })
  return data.repos
}

export interface ProfileUpdate {
  bio?: string
  avatar_url?: string
  banner_url?: string
  status_text?: string
  university?: string
  major?: string
  github_username?: string
  profile_visibility?: 'PUBLIC' | 'PRIVATE'
  show_posts?: boolean
  show_code?: boolean
  show_ideas?: boolean
  show_activity?: boolean
}

export async function updateProfile(userId: number | string, patch: ProfileUpdate) {
  const { data } = await api.patch(`/users/${userId}`, patch)
  return data
}
