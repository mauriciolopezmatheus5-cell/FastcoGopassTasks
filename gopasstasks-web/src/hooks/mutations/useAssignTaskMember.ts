import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface AssignMemberPayload {
  taskId: string;
  userId: string;
}

/**
 * Hook para asignar un usuario a una tarea.
 * Permite que el usuario pueda registrar tiempo en la tarea.
 */
export const useAssignTaskMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: AssignMemberPayload) =>
      api.post(`/v1/tasks/${taskId}/assign`, { userId }),
    onSuccess: (_, { taskId }) => {
      toast.success('Usuario asignado a la tarea');
      void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.mensaje || 'Error al asignar usuario');
    },
  });
};
