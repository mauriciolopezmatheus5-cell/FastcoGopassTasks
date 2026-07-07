/**
 * Entidad de dominio Project.
 * Representa un proyecto en el sistema. Las propiedades de identidad
 * son inmutables; el nombre y la descripción pueden actualizarse.
 */
export class Project {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public name: string,
    public description: string | null,
    public updatedAt: Date,
  ) {}
}
