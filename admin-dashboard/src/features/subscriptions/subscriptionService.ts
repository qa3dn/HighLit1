import client from '../../services/client';

export interface SubPlan {
  id: number;
  tier: string;
  name: string;
  price: string;
  currency: string;
  max_active_jobs: number;
  max_visible_applicants: number;
  can_view_applicant_contact: boolean;
  allows_featured_jobs: boolean;
}

export interface CompanySubscription {
  id: number;
  company: number;
  company_name: string;
  company_slug: string;
  plan: SubPlan;
  status: string;
  requested_by_username: string;
  activated_at: string | null;
  expires_at: string | null;
  note: string;
  created_at: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function listSubscriptions(status?: string) {
  const { data } = await client.get<Paginated<CompanySubscription> | CompanySubscription[]>(
    '/companies/subscriptions',
    { params: status ? { status } : {} },
  );
  return Array.isArray(data) ? data : data.results;
}

export async function activateSubscription(id: number, note?: string) {
  const { data } = await client.post<CompanySubscription>(
    `/companies/subscriptions/${id}/activate`,
    note ? { note } : {},
  );
  return data;
}

export async function rejectSubscription(id: number, note: string) {
  const { data } = await client.post<CompanySubscription>(
    `/companies/subscriptions/${id}/reject`,
    { note },
  );
  return data;
}
