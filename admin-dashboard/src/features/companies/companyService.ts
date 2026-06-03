import client from '../../services/client';

export interface AdminCompany {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  tagline: string;
  about: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  status: string;
  review_note: string;
  is_verified: boolean;
  follower_count: number;
  created_at: string;
}

export type CompanyPatch = Partial<
  Pick<AdminCompany, 'name' | 'tagline' | 'about' | 'industry' | 'size' | 'location' | 'website'>
>;

// Company size options (mirror backend Company.Size choices).
export const COMPANY_SIZES = ['1', '2-10', '11-50', '51-200', '201+'] as const;

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

export async function updateCompany(slug: string, patch: CompanyPatch) {
  // Admins pass is_company_manager, so they may PATCH any company.
  const { data } = await client.patch<AdminCompany>(`/companies/${slug}`, patch);
  return data;
}

// ── Detail drawer ──────────────────────────────────────────────────────────

export interface CompanyMember {
  id: number;
  user_id: number;
  username: string;
  avatar_url: string;
  role: 'OWNER' | 'ADMIN' | 'EMPLOYEE';
  title: string;
  joined_at: string;
}

export interface CompanyMedia {
  id: number;
  url: string;
  caption: string;
  created_at: string;
}

export interface CompanyDetail extends AdminCompany {
  about: string;
  size: string;
  website: string;
  logo_url: string;
  banner_url: string;
  founded_year: number | null;
  members: CompanyMember[];
  media: CompanyMedia[];
}

export interface CompanyAnalytics {
  followers: number;
  members: number;
  posts: number;
  jobs: number;
  media: number;
  is_verified: boolean;
}

export async function getCompanyDetail(slug: string) {
  const { data } = await client.get<CompanyDetail>(`/companies/${slug}`);
  return data;
}

export async function getCompanyAnalytics(slug: string) {
  const { data } = await client.get<CompanyAnalytics>(`/companies/${slug}/analytics`);
  return data;
}
