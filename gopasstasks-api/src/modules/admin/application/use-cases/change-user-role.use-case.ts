import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IAdminUserRepository } from '../../domain/ports/i-admin-user.repository';

export class ChangeUserRoleUseCase {
  constructor(private readonly adminUserRepository: IAdminUserRepository) {}

  async execute(userId: string, roleId: string): Promise<void> {
    const user = await this.adminUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`El usuario con ID '${userId}' no fue encontrado.`);
    }

    if (user.role.name === 'ADMIN') {
      const adminCount = await this.adminUserRepository.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException(
          'No se puede cambiar el rol del único administrador del sistema.',
        );
      }
    }

    await this.adminUserRepository.changeRole(userId, roleId);
  }
}
