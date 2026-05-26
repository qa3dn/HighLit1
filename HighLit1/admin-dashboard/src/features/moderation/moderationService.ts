import client from '../../services/client';

export type PostType = 'RANT' | 'CODE';

export interface ModAuthor {
  id: number;
  username: string;
  avatar_url?: string;
  rank?: string;
}

export interface ModPost {
  id: number;
  title: string;
  content: string;
  type: PostType;
  tags: string[];
  is_hidden: boolean;
  is_anonymous: boolean;
  roast_mode: boolean;
  author: ModAuthor;
  reaction_count: number;
  comment_count: number;
  created_at: string;
}

export interface ModComment {
  id: number;
  content: string;
  is_hidden: boolean;
  author: ModAuthor;
  post: { id: number; title: string; type: PostType };
  created_at: string;
}

export interface Paginated<T> {
  results: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface PostFilters {
  q?: string;
  type?: string;
  hidden?: string;
  ordering?: string;
  page?: number;
}

export interface CommentFilters {
  q?: string;
  hidden?: string;
  page?: number;
}

// Drop empty values so we never send `?q=&type=` noise to the API.
function clean(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  );
}

export async function listPosts(filters: PostFilters) {
  const { data } = await client.get<Paginated<ModPost>>('/moderation/posts', {
    params: clean(filters as Record<string, unknown>),
  });
  return data;
}

export async function setPostHidden(id: number, isHidden: boolean) {
  const { data } = await client.patch<{ id: number; is_hidden: boolean }>(
    `/moderation/posts/${id}`,
    { is_hidden: isHidden },
  );
  return data;
}

export async function deletePost(id: number) {
  await client.delete(`/moderation/posts/${id}`);
}

export async function listComments(filters: CommentFilters) {
  const { data } = await client.get<Paginated<ModComment>>('/moderation/comments', {
    params: clean(filters as Record<string, unknown>),
  });
  return data;
}

export async function setCommentHidden(id: number, isHidden: boolean) {
  const { data } = await client.patch<{ id: number; is_hidden: boolean }>(
    `/moderation/comments/${id}`,
    { is_hidden: isHidden },
  );
  return data;
}

export async function deleteComment(id: number) {
  await client.delete(`/moderation/comments/${id}`);
}
