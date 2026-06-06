import client from '../../services/client';
import type { AuditEvent } from '../activity/activityService';

export type UserRole = 'USER' | 'ADMIN' | 'COMPANY';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  rank: string;
  reputation_points: number;
  is_active: boolean;
  university?: string;
  major?: string;
}

export async function listUsers(q?: string) {
  const { data } = await client.get<AdminUser[]>('/users', { params: q ? { q } : {} });
  return data;
}

export async function setUserRole(id: number, role: UserRole) {
  const { data } = await client.post<AdminUser>(`/users/${id}/role`, { role });
  return data;
}

export async function setUserBan(id: number, isActive: boolean) {
  const { data } = await client.post<{ id: number; is_active: boolean }>(`/users/${id}/ban`, {
    is_active: isActive,
  });
  return data;
}

export async function deleteUser(id: number) {
  await client.delete(`/users/${id}`);
}

// ── Admin user-detail (one screen → one call) ──────────────────────────────

export interface UserAdminDetailUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  rank: string;
  reputation_points: number;
  bio: string;
  avatar_url: string;
  banner_url: string;
  status_text: string;
  university: string;
  major: string;
  github_username: string;
  profile_visibility: 'PUBLIC' | 'PRIVATE';
  show_posts: boolean;
  show_code: boolean;
  show_ideas: boolean;
  show_activity: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string | null;
}

export interface UserStats {
  posts: number;
  comments: number;
  projects: number;
  jobs_created: number;
  applications: number;
  reputation_points: number;
  rank: string;
}

export interface UserCompany {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  about: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  status: string;
  is_verified: boolean;
  follower_count: number;
  job_count: number;
  created_at: string;
}

export interface UserCompanies {
  items: UserCompany[];
  counts: Record<'PENDING' | 'APPROVED' | 'REJECTED', number>;
  total: number;
}

export interface UserMembership {
  company_id: number;
  name: string;
  slug: string;
  status: string;
  is_verified: boolean;
  role: string;
}

export interface UserAdminDetail {
  user: UserAdminDetailUser;
  stats: UserStats;
  companies: UserCompanies;
  memberships: UserMembership[];
  recent_activity: AuditEvent[];
}

// Profile fields an admin may edit via PATCH /users/:id. Privilege fields
// (role/rank/reputation_points/is_active) are read-only there and go through
// their dedicated endpoints instead.
export type UserProfilePatch = Partial<
  Pick<
    UserAdminDetailUser,
    | 'bio'
    | 'avatar_url'
    | 'banner_url'
    | 'status_text'
    | 'university'
    | 'major'
    | 'github_username'
    | 'profile_visibility'
    | 'show_posts'
    | 'show_code'
    | 'show_ideas'
    | 'show_activity'
  >
>;

export async function getUserAdminDetail(id: number) {
  const { data } = await client.get<UserAdminDetail>(`/users/${id}/admin-detail`);
  return data;
}

export async function updateUser(id: number, patch: UserProfilePatch) {
  const { data } = await client.patch<AdminUser>(`/users/${id}`, patch);
  return data;
}

export async function setUserPassword(id: number, password: string) {
  const { data } = await client.post<{ id: number; ok: true }>(`/users/${id}/set-password`, {
    password,
  });
  return data;
}

export async function adjustReputation(id: number, points: number) {
  const { data } = await client.post<{ reputation_points: number }>(`/users/${id}/reputation`, {
    points,
  });
  return data;
}
