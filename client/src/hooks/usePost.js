import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ── Fetch single post ─────────────────────────────────────────────────────────
export const usePost = (id) =>
  useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${id}`);
      return data.data.post;
    },
    enabled: !!id,
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  });

// ── Delete post ───────────────────────────────────────────────────────────────
export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess:  ()   => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

// ── Update post (title / description / category) ──────────────────────────────
export const useUpdatePost = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.patch(`/posts/${id}`, payload),
    onSuccess:  ()        => qc.invalidateQueries({ queryKey: ['post', id] }),
  });
};

// ── Admin: change status ──────────────────────────────────────────────────────
export const useUpdatePostStatus = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status }) => api.patch(`/admin/posts/${id}/status`, { status }),
    onSuccess:  ()           => qc.invalidateQueries({ queryKey: ['post', id] }),
  });
};

// ── Toggle upvote ─────────────────────────────────────────────────────────────
export const useToggleUpvote = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/posts/${id}/upvote`),
    onSuccess:  ()  => qc.invalidateQueries({ queryKey: ['post', id] }),
  });
};
