import { api } from '@/lib/api'

export interface Company {
  id: number
  owner_id: number
  name: string
  slug: string
  tagline: string
  about: string
  industry: string
  size: string
  location: string
  website: string
  logo_url: string
  banner_url: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  review_note: string
  is_verified: boolean
  follower_count: number
  is_manager?: boolean
}

export interface Plan {
  id: number
  tier: string
  name: string
  description: string
  price: string
  currency: string
  max_active_jobs: number
  max_visible_applicants: number
  can_view_applicant_contact: boolean
  allows_featured_jobs: boolean
  duration_days: number
}

export interface Subscription {
  id: number
  status: string
  plan: Plan
  expires_at: string | null
  created_at: string
}

export interface PlanLimits {
  tier: string
  name: string
  max_active_jobs: number
  max_visible_applicants: number
  can_view_applicant_contact: boolean
  allows_featured_jobs: boolean
}

export interface SubscriptionInfo {
  current: Subscription | null
  pending: Subscription | null
  limits: PlanLimits
  usage: { active_jobs: number }
}

export interface CompanyInput {
  name: string
  tagline?: string
  industry?: string
  location?: string
  logo_url?: string
  about?: string
}

export interface CompanyMember {
  id: number
  user_id: number
  username: string
  avatar_url: string
  role: 'OWNER' | 'ADMIN' | 'EMPLOYEE'
  title: string
  joined_at: string
}

export interface CompanyUpdate {
  name?: string
  tagline?: string
  about?: string
  industry?: string
  size?: string
  location?: string
  website?: string
  logo_url?: string
  banner_url?: string
}

export async function getMyCompanies(): Promise<Company[]> {
  const { data } = await api.get('/companies/mine')
  return Array.isArray(data) ? data : (data.results ?? [])
}

export async function createCompany(payload: CompanyInput): Promise<Company> {
  const { data } = await api.post('/companies', payload)
  return data
}

export async function updateCompany(slug: string, payload: CompanyUpdate): Promise<Company> {
  const { data } = await api.patch(`/companies/${slug}`, payload)
  return data
}

export async function listPlans(): Promise<Plan[]> {
  const { data } = await api.get('/companies/plans')
  return Array.isArray(data) ? data : (data.results ?? [])
}

export async function getSubscription(slug: string): Promise<SubscriptionInfo> {
  const { data } = await api.get(`/companies/${slug}/subscription`)
  return data
}

export async function requestSubscription(slug: string, planId: number): Promise<Subscription> {
  const { data } = await api.post(`/companies/${slug}/subscription`, { plan_id: planId })
  return data
}

export async function getCompany(slug: string): Promise<Company> {
  const { data } = await api.get(`/companies/${slug}`)
  return data
}

export async function listMembers(slug: string): Promise<CompanyMember[]> {
  const { data } = await api.get(`/companies/${slug}/members`)
  return Array.isArray(data) ? data : (data.results ?? [])
}

export async function addMember(
  slug: string,
  payload: { username: string; role: CompanyMember['role'] },
): Promise<CompanyMember> {
  const { data } = await api.post(`/companies/${slug}/members`, payload)
  return data
}

export async function removeMember(slug: string, memberId: number): Promise<void> {
  await api.delete(`/companies/${slug}/members/${memberId}`)
}
