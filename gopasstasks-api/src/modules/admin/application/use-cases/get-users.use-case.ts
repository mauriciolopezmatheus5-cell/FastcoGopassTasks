import { IAdminUserRepository, PaginatedResult, AdminUserListItem, UserListFilters } from '../../domain/ports/i-admin-user.repository';

export class GetUsersUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(filters: UserListFilters): Promise<PaginatedResult<AdminUserListItem>> {
    return this.adminUserRepository.findAll(filters);
  }
}
