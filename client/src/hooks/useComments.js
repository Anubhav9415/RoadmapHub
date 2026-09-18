import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ── Fetch flat comment list ───────────────────────────────────────────────────
export const useComments = (postId) =>
  useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data } = await api.get(`/comments?postId=${postId}`);
      return data.data.comments ?? [];
    },
    enabled: !!postId,
  });

// ── Add comment / reply ───────────────────────────────────────────────────────
export const useAddComment = (postId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/comments', payload), // { post, body, parentComment? }
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post',     postId] }); // refresh commentCount
    },
  });
};

// ── Edit comment ──────────────────────────────────────────────────────────────
export const useUpdateComment = (postId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => api.patch(`/comments/${id}`, { body }),
    onSuccess:  ()             => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  });
};

// ── Delete comment ────────────────────────────────────────────────────────────
export const useDeleteComment = (postId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/comments/${id}`),
    onSuccess:  ()   => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
      qc.invalidateQueries({ queryKey: ['post',     postId] });
    },
  });
};
