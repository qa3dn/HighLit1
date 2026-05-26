import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveCompany,
  listCompanies,
  rejectCompany,
  verifyCompany,
  type CompanyFilters,
} from './companyService';

export function useCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: ['admin-companies', filters],
    queryFn: () => listCompanies(filters),
  });
}

export function useVerifyCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, isVerified }: { slug: string; isVerified: boolean }) =>
      verifyCompany(slug, isVerified),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-companies'] }),
  });
}

export function useApproveCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, note }: { slug: string; note?: string }) => approveCompany(slug, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-companies'] }),
  });
}

export function useRejectCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, note }: { slug: string; note: string }) => rejectCompany(slug, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-companies'] }),
  });
}
