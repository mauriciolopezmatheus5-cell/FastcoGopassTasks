import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { PaginatedResult, AdminUserDto, UserListFilters } from '@/types/admin.types';

export const useAdminUsers = (filters: UserListFilters = {}) => {
  const { page = 1, limit = 10, roleId } = filters;

  return useQuery<PaginatedResult<AdminUserDto>>({
    queryKey: ['admin', 'users', { page, limit, roleId }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(roleId ? { roleId } : {}),
      });
      const { data } = await api.get<PaginatedResult<AdminUserDto>>(`/v1/admin/users?${params}`);
      return data;
    },
  });
};
