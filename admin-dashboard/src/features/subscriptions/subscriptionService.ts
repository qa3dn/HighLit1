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

export interface SubscriptionPage {
  results: CompanySubscription[];
  count: number;
  hasMore: boolean;
}

export async function listSubscriptions(
  params: { status?: string; page?: number } = {},
): Promise<SubscriptionPage> {
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  if (params.page) query.page = params.page;
  const { data } = await client.get<Paginated<CompanySubscription> | CompanySubscription[]>(
    '/companies/subscriptions',
    { params: query },
  );
  if (Array.isArray(data)) return { results: data, count: data.length, hasMore: false };
  return { results: data.results, count: data.count, hasMore: Boolean(data.next) };
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

// ── Plan management (admin) ──────────────────────────────────────────────────

export interface AdminPlan {
  id: number;
  tier: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  max_active_jobs: number;
  max_visible_applicants: number;
  can_view_applicant_contact: boolean;
  allows_featured_jobs: boolean;
  duration_days: number;
  is_active: boolean;
  sort_order: number;
}

export type PlanPatch = Partial<Omit<AdminPlan, 'id'>>;

export async function listAdminPlans() {
  const { data } = await client.get<AdminPlan[]>('/companies/admin/plans');
  return data;
}

export async function createPlan(payload: PlanPatch) {
  const { data } = await client.post<AdminPlan>('/companies/admin/plans', payload);
  return data;
}

export async function updatePlan(id: number, patch: PlanPatch) {
  const { data } = await client.patch<AdminPlan>(`/companies/admin/plans/${id}`, patch);
  return data;
}

export async function deletePlan(id: number) {
  await client.delete(`/companies/admin/plans/${id}`);
}

// ── Promo codes / discount campaigns (admin) ─────────────────────────────────

export interface PromoCode {
  id: number;
  code: string;
  discount_type: 'PERCENT' | 'FIXED';
  amount: string;
  plan: number | null;
  plan_name: string | null;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  is_redeemable: boolean;
  created_at: string;
}

export type PromoPatch = Partial<
  Pick<
    PromoCode,
    'code' | 'discount_type' | 'amount' | 'plan' | 'valid_from' | 'valid_until' | 'max_uses' | 'is_active'
  >
>;

export async function listPromoCodes() {
  const { data } = await client.get<PromoCode[]>('/companies/admin/promo-codes');
  return data;
}

export async function createPromoCode(payload: PromoPatch) {
  const { data } = await client.post<PromoCode>('/companies/admin/promo-codes', payload);
  return data;
}

export async function updatePromoCode(id: number, patch: PromoPatch) {
  const { data } = await client.patch<PromoCode>(`/companies/admin/promo-codes/${id}`, patch);
  return data;
}

export async function deletePromoCode(id: number) {
  await client.delete(`/companies/admin/promo-codes/${id}`);
}

// ── Invoices & payments (admin billing) ──────────────────────────────────────

export interface Payment {
  id: number;
  amount: string;
  currency: string;
  gateway: string;
  gateway_ref: string;
  status: string;
  created_by_username: string | null;
  created_at: string;
  settled_at: string | null;
}

export interface Invoice {
  id: number;
  company: number;
  company_name: string;
  company_slug: string;
  subscription: number | null;
  description: string;
  amount: string;
  discount_amount: string;
  total: string;
  currency: string;
  promo_code: number | null;
  promo_code_label: string | null;
  transfer_reference: string;
  proof_url: string;
  status: 'OPEN' | 'PAID' | 'VOID';
  created_at: string;
  paid_at: string | null;
  payments: Payment[];
}

export interface InvoicePage {
  results: Invoice[];
  count: number;
  hasMore: boolean;
}

interface DrfPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function listInvoices(params: { status?: string; company?: string; page?: number } = {}) {
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  if (params.company) query.company = params.company;
  if (params.page) query.page = params.page;
  const { data } = await client.get<DrfPage<Invoice> | Invoice[]>('/companies/admin/invoices', {
    params: query,
  });
  if (Array.isArray(data)) return { results: data, count: data.length, hasMore: false };
  return { results: data.results, count: data.count, hasMore: Boolean(data.next) };
}

export async function payInvoice(id: number) {
  // Stable key per invoice → repeated clicks settle at most once.
  const { data } = await client.post<Invoice>(`/companies/admin/invoices/${id}/pay`, {
    idempotency_key: `manual-${id}`,
  });
  return data;
}

export async function voidInvoice(id: number) {
  const { data } = await client.post<Invoice>(`/companies/admin/invoices/${id}/void`, {});
  return data;
}

// ── Promotion campaigns (admin) ──────────────────────────────────────────────

export interface Campaign {
  id: number;
  company: number;
  company_name: string;
  name: string;
  target_type: 'JOB' | 'COMPANY';
  job: number | null;
  job_title: string | null;
  price: string;
  currency: string;
  starts_at: string;
  ends_at: string;
  status: string;
  invoice: number | null;
  created_at: string;
}

export interface CampaignPayload {
  company: number;
  name: string;
  target_type: 'JOB' | 'COMPANY';
  job?: number | null;
  price: string;
  currency?: string;
  starts_at: string;
  ends_at: string;
}

export interface CampaignPage {
  results: Campaign[];
  count: number;
  hasMore: boolean;
}

export async function listCampaigns(params: { status?: string; page?: number } = {}) {
  const query: Record<string, string | number> = {};
  if (params.status) query.status = params.status;
  if (params.page) query.page = params.page;
  const { data } = await client.get<DrfPage<Campaign> | Campaign[]>('/companies/admin/campaigns', {
    params: query,
  });
  if (Array.isArray(data)) return { results: data, count: data.length, hasMore: false };
  return { results: data.results, count: data.count, hasMore: Boolean(data.next) };
}

export async function createCampaign(payload: CampaignPayload) {
  const { data } = await client.post<Campaign>('/companies/admin/campaigns', payload);
  return data;
}

export async function activateCampaign(id: number) {
  const { data } = await client.post<Campaign>(`/companies/admin/campaigns/${id}/activate`, {});
  return data;
}

export async function endCampaign(id: number) {
  const { data } = await client.post<Campaign>(`/companies/admin/campaigns/${id}/end`, {});
  return data;
}

export async function deleteCampaign(id: number) {
  await client.delete(`/companies/admin/campaigns/${id}`);
}
