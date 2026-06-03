import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveCompany,
  getCompanyAnalytics,
  getCompanyDetail,
  rejectCompany,
  updateCompany,
  verifyCompany,
  type CompanyPatch,
} from './companyService';

const detailKey = (slug: string) => ['admin-company-detail', slug] as const;
const analyticsKey = (slug: string) => ['admin-company-analytics', slug] as const;

export function useCompanyDetail(slug: string) {
  return useQuery({
    queryKey: detailKey(slug),
    queryFn: () => getCompanyDetail(slug),
    staleTime: 0,
  });
}

export function useCompanyAnalytics(slug: string) {
  return useQuery({
    queryKey: analyticsKey(slug),
    queryFn: () => getCompanyAnalytics(slug),
  });
}

function useDrawerInvalidation(slug: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: detailKey(slug) });
    qc.invalidateQueries({ queryKey: analyticsKey(slug) });
    qc.invalidateQueries({ queryKey: ['admin-companies'] });
  };
}

export function useApproveCompanyDetail(slug: string) {
  const refresh = useDrawerInvalidation(slug);
  return useMutation({ mutationFn: (note?: string) => approveCompany(slug, note), onSuccess: refresh });
}

export function useRejectCompanyDetail(slug: string) {
  const refresh = useDrawerInvalidation(slug);
  return useMutation({ mutationFn: (note: string) => rejectCompany(slug, note), onSuccess: refresh });
}

export function useVerifyCompanyDetail(slug: string) {
  const refresh = useDrawerInvalidation(slug);
  return useMutation({ mutationFn: (isVerified: boolean) => verifyCompany(slug, isVerified), onSuccess: refresh });
}

export function useUpdateCompanyDetail(slug: string) {
  const refresh = useDrawerInvalidation(slug);
  return useMutation({ mutationFn: (patch: CompanyPatch) => updateCompany(slug, patch), onSuccess: refresh });
}
