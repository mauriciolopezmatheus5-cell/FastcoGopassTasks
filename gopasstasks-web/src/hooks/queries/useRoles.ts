import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { RoleDto } from '@/types/admin.types';

export const useRoles = () =>
  useQuery<RoleDto[]>({
    queryKey: ['admin', 'roles'],
    queryFn: async () => {
      const { data } = await api.get<RoleDto[]>('/v1/admin/roles');
      return data;
    },
  });
