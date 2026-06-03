import client from '../../services/client';

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

export interface WeeklyActivityPoint {
  date: string;
  actions: number;
  active_users: number;
}

export interface TechUsageSlice {
  name: string;
  value: number;
}

export interface OverviewReview {
  id: number;
  author: string;
  job_title: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface AdminOverview {
  users: { total: number; banned: number; admins: number; companies: number };
  content: { posts: number; comments: number; reactions: number };
  projects: { published: number; hidden: number; rejected: number };
  companies: { total: number; verified: number; jobs: number };
  recent_activity: AuditEvent[];
  weekly_activity: WeeklyActivityPoint[];
  tech_usage: TechUsageSlice[];
  recent_reviews: OverviewReview[];
}

export async function getOverview() {
  const { data } = await client.get<AdminOverview>('/moderation/overview');
  return data;
}
