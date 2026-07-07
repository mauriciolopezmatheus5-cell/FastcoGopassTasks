import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/adapters/input/user.controller';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';

/**
 * Módulo de usuarios.
 * Expone el perfil del usuario autenticado: GET /v1/users/me, PATCH /v1/users/me.
 */
@Module({
  imports: [PrismaModule],
  controllers: [UserController],
})
export class UsersModule {}
