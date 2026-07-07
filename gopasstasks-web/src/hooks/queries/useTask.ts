import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TaskStatus } from '@/types/task.types';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  projectId: string;
  assignedTo?: string[];
  assignedMembers: Array<{ userId: string; name: string; email: string }>;
  estimatedTimeMin: number;
  startDate: string | null;
  dueDate: string | null;
  endDate: string | null;
  workLogTotal: number;
  createdAt: string;
  updatedAt: string;
}

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await api.get<Task>(`/v1/tasks/${id}`);
      return data;
    },
  });
};
