/**
 * Entidad de dominio User.
 * Representa al usuario del sistema sin dependencias de framework ni ORM.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly createdAt: Date,
    public name: string,
    public passwordHash: string,
    public roleId: string,
    public isActive: boolean,
    /** Nombre del rol (ej: 'ADMIN', 'DEVELOPER'). Poblado por el repositorio. */
    public roleName: string = '',
  ) {}
}
