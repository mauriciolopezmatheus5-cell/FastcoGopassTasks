import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface Project {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  taskCount: number;
  createdAt: string;
}

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data } = await api.get<Project>(`/v1/projects/${id}`);
      return data;
    },
  });
};
