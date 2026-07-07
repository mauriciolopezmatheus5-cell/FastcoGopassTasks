import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { TaskStatus } from '@/types/task.types';
import type { TaskItem } from '@/hooks/queries/useTasks';

interface UpdateStatusPayload {
  taskId: string;
  status: TaskStatus;
}

interface ApiErrorResponse {
  mensaje?: string;
}

interface MutationContext {
  previousQueries: Array<[readonly unknown[], TaskItem[] | undefined]>;
}

export const useUpdateTaskStatus = (projectId?: string) => {
  const queryClient = useQueryClient();
  const baseQueryKey: readonly unknown[] = projectId ? ['tasks', projectId] : ['tasks'];

  return useMutation<unknown, AxiosError<ApiErrorResponse>, UpdateStatusPayload, MutationContext>({
    mutationFn: ({ taskId, status }: UpdateStatusPayload) =>
      api.patch(`/v1/tasks/${taskId}/status`, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: baseQueryKey });

      const previousQueries = queryClient.getQueriesData<TaskItem[]>({
        queryKey: baseQueryKey,
      });

      queryClient.setQueriesData<TaskItem[]>({ queryKey: baseQueryKey }, (currentTasks) => {
        if (!Array.isArray(currentTasks)) {
          return currentTasks;
        }

        return currentTasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }
          return { ...task, status };
        });
      });

      return { previousQueries };
    },
    onSuccess: () => {
      toast.success('Estado actualizado');
    },
    onError: (error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, snapshot]) => {
        queryClient.setQueryData(queryKey, snapshot);
      });

      toast.error(error.response?.data?.mensaje ?? 'Error al actualizar estado');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: baseQueryKey });
    },
  });
};
