import { NotFoundException } from '@nestjs/common';
import { IAdminUserRepository, AdminUserDetail } from '../../domain/ports/i-admin-user.repository';

export class GetUserByIdUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(id: string): Promise<AdminUserDetail> {
    const user = await this.adminUserRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`El usuario con ID '${id}' no fue encontrado.`);
    }
    return user;
  }
}
