import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateSubscription,
  listSubscriptions,
  rejectSubscription,
} from './subscriptionService';

export function useSubscriptions(status?: string) {
  return useQuery({
    queryKey: ['admin-subscriptions', status ?? ''],
    queryFn: () => listSubscriptions(status),
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
