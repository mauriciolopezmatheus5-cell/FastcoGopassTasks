import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface LogWorkPayload {
  taskId: string;
  timeSpentMinutes: number;
  description?: string;
}

export const useLogWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, timeSpentMinutes, description }: LogWorkPayload) =>
      api.post(`/v1/tasks/${taskId}/work-logs`, {
        timeSpentMinutes,
        description,
      }),
    onSuccess: (_, { taskId }) => {
      toast.success('Tiempo registrado');
      void queryClient.invalidateQueries({ queryKey: ['work-logs', taskId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al registrar tiempo');
    },
  });
};
