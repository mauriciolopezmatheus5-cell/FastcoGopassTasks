import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface WorkLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  timeSpentMinutes: number;
  description: string | null;
  recordedAt: string;
}

export const useWorkLogs = (taskId: string) => {
  return useQuery({
    queryKey: ['work-logs', taskId],
    queryFn: async () => {
      const { data } = await api.get<WorkLog[]>(`/v1/tasks/${taskId}/work-logs`);
      return data;
    },
  });
};
