import { useQuery } from '@tanstack/react-query';
import { getOverview } from './dashboardService';

export function useOverview() {
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: getOverview,
    staleTime: 30_000,
  });
}
