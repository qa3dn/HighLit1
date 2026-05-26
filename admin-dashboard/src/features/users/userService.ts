import client from '../../services/client';

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
