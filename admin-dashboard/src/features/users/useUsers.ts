import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteUser,
  listUsers,
  setUserBan,
  setUserRole,
  type UserRole,
} from './userService';

export function useUsers(q?: string) {
  return useQuery({
    queryKey: ['admin-users', q ?? ''],
    queryFn: () => listUsers(q),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) => setUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useSetUserBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => setUserBan(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}
