import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateCampaign,
  activateSubscription,
  createCampaign,
  createPlan,
  createPromoCode,
  deleteCampaign,
  deletePlan,
  deletePromoCode,
  endCampaign,
  listAdminPlans,
  listCampaigns,
  listInvoices,
  listPromoCodes,
  listSubscriptions,
  payInvoice,
  rejectSubscription,
  updatePlan,
  updatePromoCode,
  voidInvoice,
  type CampaignPayload,
  type PlanPatch,
  type PromoPatch,
} from './subscriptionService';

export function useSubscriptions(status: string, page: number) {
  return useQuery({
    queryKey: ['admin-subscriptions', status, page],
    queryFn: () => listSubscriptions({ status: status || undefined, page }),
  });
}

export function useActivateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) => activateSubscription(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });
}

export function useRejectSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => rejectSubscription(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-subscriptions'] }),
  });
}

// ── Plans ────────────────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery({ queryKey: ['admin-plans'], queryFn: listAdminPlans });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlanPatch) => createPlan(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: PlanPatch }) => updatePlan(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  });
}

// ── Promo codes ──────────────────────────────────────────────────────────────

export function usePromoCodes() {
  return useQuery({ queryKey: ['admin-promo-codes'], queryFn: listPromoCodes });
}

export function useCreatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PromoPatch) => createPromoCode(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promo-codes'] }),
  });
}

export function useUpdatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: PromoPatch }) => updatePromoCode(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promo-codes'] }),
  });
}

export function useDeletePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePromoCode(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promo-codes'] }),
  });
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export function useInvoices(status: string, page: number) {
  return useQuery({
    queryKey: ['admin-invoices', status, page],
    queryFn: () => listInvoices({ status: status || undefined, page }),
  });
}

export function usePayInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => payInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] }),
  });
}

export function useVoidInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => voidInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] }),
  });
}

// ── Campaigns ────────────────────────────────────────────────────────────────

export function useCampaigns(status: string, page: number) {
  return useQuery({
    queryKey: ['admin-campaigns', status, page],
    queryFn: () => listCampaigns({ status: status || undefined, page }),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignPayload) => createCampaign(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-campaigns'] }),
  });
}

export function useActivateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activateCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-campaigns'] }),
  });
}

export function useEndCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => endCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-campaigns'] }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-campaigns'] }),
  });
}
