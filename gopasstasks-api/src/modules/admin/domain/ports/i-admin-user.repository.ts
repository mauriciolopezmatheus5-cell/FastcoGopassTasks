export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string };
  projectCount: number;
  taskCount: number;
  createdAt: Date;
}

export interface AdminUserDetail extends AdminUserListItem {
  projects: Array<{ id: string; name: string; memberRole: string }>;
}

export interface UserListFilters {
  roleId?: string;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAdminUserRepository {
  findAll(filters: UserListFilters): Promise<PaginatedResult<AdminUserListItem>>;
  findById(id: string): Promise<AdminUserDetail | null>;
  changeRole(userId: string, roleId: string): Promise<void>;
  deactivate(userId: string): Promise<void>;
  countAdmins(): Promise<number>;
  findRoles(): Promise<Array<{ id: string; name: string; description: string | null; userCount: number }>>;
  findRoleById(id: string): Promise<{ id: string; name: string; description: string | null; users: Array<{ id: string; name: string; email: string }> } | null>;
}
