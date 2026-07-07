import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { TaskStatus } from '@/types/task.types';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  projectId: string;
  assignedTo?: string[];
  assignedMembers?: Array<{ userId: string; name: string; email: string }>;
  estimatedTimeMin: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseTasksParams {
  projectId: string;
  status?: TaskStatus;
  priority?: number;
}

export const useTasks = ({ projectId, status, priority }: UseTasksParams) => {
  return useQuery({
    queryKey: ['tasks', projectId, { status, priority }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority !== undefined) params.append('priority', String(priority));

      const queryString = params.toString();
      const { data } = await api.get<TaskItem[]>(
        `/v1/projects/${projectId}/tasks${queryString.length > 0 ? `?${queryString}` : ''}`
      );
      return data;
    },
  });
};
