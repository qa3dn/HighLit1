import { useQuery } from '@tanstack/react-query';
import { listAuditEvents, type AuditFilters } from './activityService';

export function useActivity(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ['admin-activity', filters],
    queryFn: () => listAuditEvents(filters),
  });
}
