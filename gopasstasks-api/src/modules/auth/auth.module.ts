import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './infrastructure/adapters/input/strategies/jwt.strategy';
import { AuthController } from './infrastructure/adapters/input/auth.controller';
import { PrismaUserRepository } from './infrastructure/adapters/output/prisma-user.repository';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { USER_REPOSITORY, IUserRepository } from './domain/ports/i-user.repository';
import { PrismaService } from '../../shared/infrastructure/database/prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: LoginUseCase,
      useFactory: (userRepo: IUserRepository, jwtService: JwtService) =>
        new LoginUseCase(userRepo, jwtService),
      inject: [USER_REPOSITORY, JwtService],
    },
    {
      provide: RegisterUseCase,
      useFactory: (userRepo: IUserRepository, prisma: PrismaService) =>
        new RegisterUseCase(userRepo, prisma),
      inject: [USER_REPOSITORY, PrismaService],
    },
  ],
  exports: [JwtModule, PassportModule, USER_REPOSITORY],
})
export class AuthModule {}
