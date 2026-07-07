import { NotFoundException } from '@nestjs/common';
import { IAdminUserRepository } from '../../domain/ports/i-admin-user.repository';

export class GetRoleByIdUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(id: string) {
    const role = await this.adminUserRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`El rol con ID '${id}' no fue encontrado.`);
    }
    return role;
  }
}
