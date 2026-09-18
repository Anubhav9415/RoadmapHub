import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ── Admin: Fetch all posts ────────────────────────────────────────────────────
export const useAdminPosts = () =>
  useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data } = await api.get('/admin/posts');
      return data.data?.posts ?? data.data ?? [];
    },
  });

// ── Admin: Fetch all users ────────────────────────────────────────────────────
export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.data?.users ?? data.data ?? [];
    },
  });

// ── Admin: Change Post Status ─────────────────────────────────────────────────
export const useAdminUpdatePostStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/posts/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });
};

// ── Admin: Hard Delete Post ───────────────────────────────────────────────────
export const useAdminDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/posts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });
};

// ── Admin: Update User Role ───────────────────────────────────────────────────
export const useAdminUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};
