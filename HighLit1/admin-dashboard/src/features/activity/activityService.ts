import client from '../../services/client';
import type { Paginated } from '../companies/companyService';

export interface AuditEvent {
  id: number;
  actor: number | null;
  actor_username: string | null;
  action: string;
  target_type: string;
  target_id: string;
  payload: Record<string, unknown>;
  ip: string | null;
  request_id: string;
  created_at: string;
}

export interface AuditFilters {
  action?: string;
  actor?: number;
  page?: number;
}

export async function listAuditEvents(filters: AuditFilters = {}) {
  const { data } = await client.get<Paginated<AuditEvent>>('/audit', { params: filters });
  return data;
}
