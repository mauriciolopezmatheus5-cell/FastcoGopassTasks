import { User } from '../entities/user.entity';

/**
 * Puerto de salida (Output Port) del repositorio de usuarios.
 * Define el contrato que cualquier implementación de persistencia debe cumplir.
 * El dominio depende de esta interfaz, nunca de Prisma directamente.
 */
export interface IUserRepository {
  /**
   * Busca un usuario por su identificador único.
   * @param id - UUID del usuario
   * @returns La entidad User si existe, o null si no se encontró
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario por su dirección de correo electrónico.
   * @param email - Email del usuario
   * @returns La entidad User si existe, o null si no se encontró
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Persiste un usuario nuevo o actualiza uno existente.
   * @param user - Entidad User con los datos a persistir
   * @returns La entidad User persistida
   */
  save(user: User): Promise<User>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
