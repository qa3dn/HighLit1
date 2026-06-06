import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approvePost,
  deleteComment,
  deletePost,
  listComments,
  listPosts,
  rejectPost,
  setCommentHidden,
  setPostHidden,
  type CommentFilters,
  type PostFilters,
} from './moderationService';

export function usePosts(filters: PostFilters, enabled = true) {
  return useQuery({
    queryKey: ['mod-posts', filters],
    queryFn: () => listPosts(filters),
    enabled,
  });
}

export function useComments(filters: CommentFilters, enabled = true) {
  return useQuery({
    queryKey: ['mod-comments', filters],
    queryFn: () => listComments(filters),
    enabled,
  });
}

export function useSetPostHidden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) => setPostHidden(id, isHidden),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod-posts'] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod-posts'] }),
  });
}

export function useSetCommentHidden() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) => setCommentHidden(id, isHidden),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod-comments'] }),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod-comments'] }),
  });
}

export function useApprovePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approvePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod-posts'] }),
  });
}

export function useRejectPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectPost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mod-posts'] }),
  });
}
