import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export const useDeleteTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => api.delete(`/v1/tasks/${taskId}`),
    onSuccess: () => {
      toast.success('Tarea eliminada');
      void queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje ?? 'Error al eliminar la tarea');
    },
  });
};
