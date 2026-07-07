export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  userCount: number;
}

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string };
  projectCount: number;
  taskCount: number;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListFilters {
  page?: number;
  limit?: number;
  roleId?: string;
}
