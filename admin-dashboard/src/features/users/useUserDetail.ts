import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adjustReputation,
  getUserAdminDetail,
  setUserBan,
  setUserPassword,
  setUserRole,
  updateUser,
  type UserProfilePatch,
  type UserRole,
} from './userService';
import {
  approveCompany,
  rejectCompany,
  updateCompany,
  verifyCompany,
  type CompanyPatch,
} from '../companies/companyService';

const detailKey = (id: number) => ['admin-user-detail', id] as const;

export function useUserAdminDetail(id: number) {
  return useQuery({
    queryKey: detailKey(id),
    queryFn: () => getUserAdminDetail(id),
    staleTime: 0,
  });
}

/** Refreshes the open drawer's detail plus the underlying users list. */
function useDrawerInvalidation(id: number) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: detailKey(id) });
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  };
}

export function useUpdateUserProfile(id: number) {
  const refresh = useDrawerInvalidation(id);
  return useMutation({
    mutationFn: (patch: UserProfilePatch) => updateUser(id, patch),
    onSuccess: refresh,
  });
}

export function useChangeUserRole(id: number) {
  const refresh = useDrawerInvalidation(id);
  return useMutation({
    mutationFn: (role: UserRole) => setUserRole(id, role),
    onSuccess: refresh,
  });
}

export function useToggleUserBan(id: number) {
  const refresh = useDrawerInvalidation(id);
  return useMutation({
    mutationFn: (isActive: boolean) => setUserBan(id, isActive),
    onSuccess: refresh,
  });
}

export function useAdjustReputation(id: number) {
  const refresh = useDrawerInvalidation(id);
  return useMutation({
    mutationFn: (points: number) => adjustReputation(id, points),
    onSuccess: refresh,
  });
}

export function useSetUserPassword(id: number) {
  // No cache to invalidate — a password change doesn't alter any read model.
  return useMutation({ mutationFn: (password: string) => setUserPassword(id, password) });
}

// ── Company actions, scoped so they refresh the user-detail drawer ──────────

function useCompanyAction<TArgs>(id: number, fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: detailKey(id) });
      qc.invalidateQueries({ queryKey: ['admin-companies'] });
    },
  });
}

export function useApproveCompany(id: number) {
  return useCompanyAction(id, ({ slug, note }: { slug: string; note?: string }) =>
    approveCompany(slug, note),
  );
}

export function useRejectCompany(id: number) {
  return useCompanyAction(id, ({ slug, note }: { slug: string; note: string }) =>
    rejectCompany(slug, note),
  );
}

export function useVerifyCompany(id: number) {
  return useCompanyAction(id, ({ slug, isVerified }: { slug: string; isVerified: boolean }) =>
    verifyCompany(slug, isVerified),
  );
}

export function useUpdateCompany(id: number) {
  return useCompanyAction(id, ({ slug, patch }: { slug: string; patch: CompanyPatch }) =>
    updateCompany(slug, patch),
  );
}
