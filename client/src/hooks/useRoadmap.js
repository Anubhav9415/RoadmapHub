import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * useRoadmap — Fetches all roadmap items (planned, in_progress, completed)
 * and polls every 30 seconds.
 */
export const useRoadmap = () =>
  useQuery({
    queryKey: ['roadmap'],
    queryFn: async () => {
      const { data } = await api.get('/posts?limit=150');
      const posts = data.data?.posts ?? data.data ?? [];
      return {
        planned: posts.filter((p) => p.status === 'planned'),
        inProgress: posts.filter((p) => p.status === 'in_progress'),
        completed: posts.filter((p) => p.status === 'completed'),
      };
    },
    refetchInterval: 30000,
  });
