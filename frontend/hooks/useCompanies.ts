import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addMember,
  createCompany,
  getCompany,
  getMyCompanies,
  getSubscription,
  listMembers,
  listPlans,
  quoteSubscription,
  removeMember,
  requestSubscription,
  updateCompany,
  type CompanyInput,
  type CompanyMember,
  type CompanyUpdate,
  type SubscriptionRequest,
} from '@/lib/api/companies'

export function useMyCompanies(enabled = true) {
  return useQuery({ queryKey: ['my-companies'], queryFn: getMyCompanies, enabled })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CompanyInput) => createCompany(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-companies'] }),
  })
}

export function useUpdateCompany(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CompanyUpdate) => updateCompany(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-companies'] })
      queryClient.invalidateQueries({ queryKey: ['subscription', slug] })
    },
  })
}

export function useCompany(slug: string | undefined) {
  return useQuery({
    queryKey: ['company', slug],
    queryFn: () => getCompany(slug!),
    enabled: !!slug,
  })
}

export function useMembers(slug: string | undefined) {
  return useQuery({
    queryKey: ['company-members', slug],
    queryFn: () => listMembers(slug!),
    enabled: !!slug,
  })
}

export function useAddMember(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { username: string; role: CompanyMember['role'] }) => addMember(slug, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company-members', slug] }),
  })
}

export function useRemoveMember(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: number) => removeMember(slug, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company-members', slug] }),
  })
}

export function usePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: listPlans, staleTime: 5 * 60 * 1000 })
}

export function useSubscription(slug: string | undefined) {
  return useQuery({
    queryKey: ['subscription', slug],
    queryFn: () => getSubscription(slug!),
    enabled: !!slug,
  })
}

export function useRequestSubscription(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: SubscriptionRequest) => requestSubscription(slug, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription', slug] }),
  })
}

export function useQuoteSubscription(slug: string) {
  return useMutation({
    mutationFn: (body: { plan_id: number; promo_code?: string }) => quoteSubscription(slug, body),
  })
}
