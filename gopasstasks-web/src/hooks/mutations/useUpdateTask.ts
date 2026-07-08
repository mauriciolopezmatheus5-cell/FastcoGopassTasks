import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface UpdateTaskPayload {
  taskId: string;
  title: string;
  description?: string;
}

export const useUpdateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, title, description }: UpdateTaskPayload) =>
      api.patch(`/v1/tasks/${taskId}`, { title, description }),
    onSuccess: () => {
      toast.success('Tarea actualizada');
      void queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje ?? 'Error al actualizar la tarea');
    },
  });
};
