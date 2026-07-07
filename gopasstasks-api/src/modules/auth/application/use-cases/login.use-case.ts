import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/ports/i-user.repository';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Iniciar sesión.
 *
 * Verifica credenciales del usuario y genera un JWT si son válidas.
 * El token se retorna para que el controlador lo establezca como cookie HttpOnly.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Ejecuta el login con email y contraseña.
   *
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns JWT firmado y datos básicos del usuario
   * @throws RecursoNoEncontradoException si el email no está registrado
   * @throws ReglaNegocioException si la contraseña es incorrecta o el usuario está inactivo
   */
  async execute(
    email: string,
    password: string,
  ): Promise<{ token: string; user: { id: string; name: string; email: string; role: string; createdAt: string } }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new RecursoNoEncontradoException('usuario', email);
    }

    if (!user.isActive) {
      throw new ReglaNegocioException('Usuario inactivo. Contacte al administrador.');
    }

    const passwordValida = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValida) {
      throw new ReglaNegocioException('Credenciales inválidas.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roleName,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.roleName, createdAt: user.createdAt.toISOString() },
    };
  }
}
