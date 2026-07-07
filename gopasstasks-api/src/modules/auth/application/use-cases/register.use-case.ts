import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { IUserRepository } from '../../domain/ports/i-user.repository';
import { User } from '../../domain/entities/user.entity';
import {
  RecursoDuplicadoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Registrar un nuevo usuario.
 *
 * Verifica que el email no esté en uso, hashea la contraseña
 * y asigna el rol DEVELOPER por defecto.
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Ejecuta el registro de un nuevo usuario.
   *
   * @param name - Nombre completo del usuario
   * @param email - Email único del usuario
   * @param password - Contraseña en texto plano (será hasheada)
   * @returns La entidad User recién creada
   * @throws RecursoDuplicadoException si el email ya está registrado
   * @throws ReglaNegocioException si el rol DEVELOPER no está configurado
   */
  async execute(name: string, email: string, password: string): Promise<User> {
    const usuarioExistente = await this.userRepository.findByEmail(email);
    if (usuarioExistente) {
      throw new RecursoDuplicadoException('usuario', 'email');
    }

    const rolDeveloper = await this.prisma.role.findUnique({
      where: { name: 'DEVELOPER' },
    });
    if (!rolDeveloper) {
      throw new ReglaNegocioException('El rol DEVELOPER no está configurado en el sistema.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoUsuario = new User(
      uuid(),
      email,
      new Date(),
      name,
      passwordHash,
      rolDeveloper.id,
      true,
      rolDeveloper.name,
    );

    return this.userRepository.save(nuevoUsuario);
  }
}
