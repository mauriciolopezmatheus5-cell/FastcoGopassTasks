import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: number;
  estimatedTimeMin: number;
  projectId: string;
}

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) =>
      api.post('/v1/tasks', payload),
    onSuccess: () => {
      toast.success('Tarea creada exitosamente');
      void queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al crear tarea');
    },
  });
};
