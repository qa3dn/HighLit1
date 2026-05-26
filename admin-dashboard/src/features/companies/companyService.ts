import client from '../../services/client';

export interface AdminCompany {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  tagline: string;
  industry: string;
  location: string;
  status: string;
  review_note: string;
  is_verified: boolean;
  follower_count: number;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CompanyFilters {
  q?: string;
  status?: string;
  verified?: 'true' | 'false';
  page?: number;
}

export async function listCompanies(filters: CompanyFilters = {}) {
  // Admin endpoint — returns all companies (any status), unlike the public list.
  const { data } = await client.get<Paginated<AdminCompany>>('/companies/admin/list', { params: filters });
  return data;
}

export async function verifyCompany(slug: string, isVerified: boolean) {
  const { data } = await client.post<AdminCompany>(`/companies/${slug}/verify`, {
    is_verified: isVerified,
  });
  return data;
}

export async function approveCompany(slug: string, note?: string) {
  const { data } = await client.post<AdminCompany>(`/companies/${slug}/approve`, note ? { note } : {});
  return data;
}

export async function rejectCompany(slug: string, note: string) {
  const { data } = await client.post<AdminCompany>(`/companies/${slug}/reject`, { note });
  return data;
}
