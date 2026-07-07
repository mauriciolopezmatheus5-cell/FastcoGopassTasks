import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';
import { IProjectRepository } from '../../domain/ports/i-project.repository';

/**
 * Caso de uso: Eliminar un proyecto.
 * Solo el miembro con rol ADMIN puede eliminar el proyecto.
 */
export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Elimina el proyecto si el usuario es ADMIN.
   *
   * @param id - UUID del proyecto a eliminar
   * @param userId - ID del usuario que realiza la acción
   * @throws RecursoNoEncontradoException si el proyecto no existe
   * @throws ReglaNegocioException si el usuario no es ADMIN del proyecto
   */
  async execute(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new RecursoNoEncontradoException('proyecto', id);
    }

    const role = await this.projectRepository.getUserRole(id, userId);
    if (role !== 'ADMIN') {
      throw new ReglaNegocioException('Solo el administrador puede eliminar el proyecto.');
    }

    await this.projectRepository.delete(id);
  }
}
