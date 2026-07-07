import { Module } from '@nestjs/common';
import { AdminController } from './infrastructure/adapters/input/admin.controller';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { ChangeUserRoleUseCase } from './application/use-cases/change-user-role.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';
import { GetRolesUseCase } from './application/use-cases/get-roles.use-case';
import { GetRoleByIdUseCase } from './application/use-cases/get-role-by-id.use-case';
import { PrismaAdminUserRepository } from './infrastructure/adapters/output/prisma-admin-user.repository';

export const ADMIN_USER_REPOSITORY = 'ADMIN_USER_REPOSITORY';

@Module({
  controllers: [AdminController],
  providers: [
    {
      provide: ADMIN_USER_REPOSITORY,
      useClass: PrismaAdminUserRepository,
    },
    {
      provide: GetUsersUseCase,
      useFactory: (repo: PrismaAdminUserRepository) => new GetUsersUseCase(repo),
      inject: [ADMIN_USER_REPOSITORY],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (repo: PrismaAdminUserRepository) => new GetUserByIdUseCase(repo),
      inject: [ADMIN_USER_REPOSITORY],
    },
    {
      provide: ChangeUserRoleUseCase,
      useFactory: (repo: PrismaAdminUserRepository) => new ChangeUserRoleUseCase(repo),
      inject: [ADMIN_USER_REPOSITORY],
    },
    {
      provide: DeactivateUserUseCase,
      useFactory: (repo: PrismaAdminUserRepository) => new DeactivateUserUseCase(repo),
      inject: [ADMIN_USER_REPOSITORY],
    },
    {
      provide: GetRolesUseCase,
      useFactory: (repo: PrismaAdminUserRepository) => new GetRolesUseCase(repo),
      inject: [ADMIN_USER_REPOSITORY],
    },
    {
      provide: GetRoleByIdUseCase,
      useFactory: (repo: PrismaAdminUserRepository) => new GetRoleByIdUseCase(repo),
      inject: [ADMIN_USER_REPOSITORY],
    },
  ],
})
export class AdminModule {}
