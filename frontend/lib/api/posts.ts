import { api } from '../api'

export type PostType = 'RANT' | 'CODE'
export type FeedSort = 'hot' | 'recent' | 'top'

export interface PostAuthor {
  id: number
  username: string
  avatar_url: string
  rank: string
}

export interface Post {
  id: number
  user_id: number
  author: PostAuthor | null
  is_anonymous: boolean
  title: string
  content: string
  type: PostType
  tags: string[]
  roast_mode: boolean
  reaction_count: number
  comment_count: number
  reactions: { type: string; count: number }[]
  viewer_reactions: string[]
  created_at: string
}

export interface FeedResponse {
  posts: Post[]
  total: number
  page: number
  limit: number
  has_more: boolean
  locked: boolean
  remaining_locked: number
  is_authenticated: boolean
  sort: FeedSort
}

export interface FeedParams {
  sort?: FeedSort
  tag?: string
  q?: string
  type?: PostType
  page?: number
  limit?: number
}

export async function getFeed(params: FeedParams = {}): Promise<FeedResponse> {
  const { data } = await api.get<FeedResponse>('/posts/feed', { params })
  return data
}

export interface CreatePostPayload {
  content: string
  title?: string
  type?: PostType
  tags?: string[]
  is_anonymous?: boolean
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const { data } = await api.post<Post>('/posts', payload)
  return data
}

export interface ReactionResult {
  reacted: boolean
  totals: { type: string; count: number }[]
  reaction_count: number
}

export async function toggleReaction(postId: number, type: string): Promise<ReactionResult> {
  const { data } = await api.post<ReactionResult>(`/posts/${postId}/reactions`, { type })
  return data
}

export interface PostComment {
  id: number
  post: number
  user_id: number
  author: { id: number; username: string; avatar_url: string }
  content: string
  created_at: string
}

export async function getComments(postId: number): Promise<PostComment[]> {
  const { data } = await api.get<PostComment[]>(`/posts/${postId}/comments`)
  return data
}

export async function addComment(postId: number, content: string): Promise<PostComment> {
  const { data } = await api.post<PostComment>(`/posts/${postId}/comments`, { content })
  return data
}
