import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma.service';
import { IUserRepository } from '../../../domain/ports/i-user.repository';
import { User } from '../../../domain/entities/user.entity';
import { RecursoDuplicadoException } from '../../../../../shared/domain/exceptions';

/**
 * Tipo guard para verificar si un error es un PrismaClientKnownRequestError.
 * Evita problemas de tipos cuando Prisma Client no está completamente inicializado.
 */
function isPrismaClientKnownRequestError(error: unknown): error is { code: string; message: string } {
  if (!(error instanceof Error)) return false;
  const err = error as unknown as { code?: unknown; message?: string };
  return typeof err.code === 'string' && typeof err.message === 'string';
}

/**
 * Implementación del repositorio de usuarios usando Prisma ORM.
 * Adaptador de salida (Output Adapter). Encapsula todas las operaciones
 * de base de datos del módulo de autenticación.
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca un usuario por su ID incluyendo el rol asociado.
   */
  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!prismaUser) return null;
    return this.mapToDomain(prismaUser);
  }

  /**
   * Busca un usuario por su email incluyendo el rol asociado.
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!prismaUser) return null;
    return this.mapToDomain(prismaUser);
  }

  /**
   * Persiste un usuario. Hace upsert: crea si no existe, actualiza si ya tiene id registrado.
   * Captura P2002 (email duplicado) y lanza RecursoDuplicadoException.
   */
  async save(user: User): Promise<User> {
    try {
      const prismaUser = await this.prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          roleId: user.roleId,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        update: {
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          roleId: user.roleId,
          isActive: user.isActive,
        },
        include: { role: true },
      });
      return this.mapToDomain(prismaUser);
    } catch (error) {
      if (isPrismaClientKnownRequestError(error) && error.code === 'P2002') {
        throw new RecursoDuplicadoException('usuario', 'email');
      }
      throw error;
    }
  }

  /**
   * Convierte el modelo de Prisma (con rol incluido) a la entidad de dominio User.
   */
  private mapToDomain(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.createdAt,
      prismaUser.name,
      prismaUser.passwordHash,
      prismaUser.roleId,
      prismaUser.isActive,
      prismaUser.role.name,
    );
  }
}
