import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface CreateProjectPayload {
  name: string;
  description?: string;
}

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      api.post('/v1/projects', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
