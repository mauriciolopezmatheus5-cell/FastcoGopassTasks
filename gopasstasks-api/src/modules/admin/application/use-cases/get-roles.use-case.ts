import { IAdminUserRepository } from '../../domain/ports/i-admin-user.repository';

export class GetRolesUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(): Promise<Array<{ id: string; name: string; description: string | null; userCount: number }>> {
    return this.adminUserRepository.findRoles();
  }
}
