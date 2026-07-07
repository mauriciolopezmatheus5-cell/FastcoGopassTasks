import { ReglaNegocioException } from '../../../../shared/domain/exceptions';
import { IProjectRepository } from '../../domain/ports/i-project.repository';

/**
 * Caso de uso: Remover un miembro de un proyecto.
 * Solo el ADMIN puede remover miembros. No se puede eliminar al último ADMIN.
 */
export class RemoveProjectMemberUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Remueve la membresía de un usuario en el proyecto.
   *
   * @param projectId - ID del proyecto
   * @param targetUserId - ID del usuario a remover
   * @param requesterId - ID del usuario que realiza la acción
   * @throws ReglaNegocioException si el solicitante no es ADMIN
   * @throws ReglaNegocioException si se intenta eliminar al último ADMIN
   */
  async execute(projectId: string, targetUserId: string, requesterId: string): Promise<void> {
    const requesterRole = await this.projectRepository.getUserRole(projectId, requesterId);
    if (requesterRole !== 'ADMIN') {
      throw new ReglaNegocioException('Solo el administrador puede remover miembros del proyecto.');
    }

    const targetRole = await this.projectRepository.getUserRole(projectId, targetUserId);
    if (targetRole === 'ADMIN') {
      const adminCount = await this.projectRepository.getAdminCount(projectId);
      if (adminCount <= 1) {
        throw new ReglaNegocioException('No puedes eliminar al último administrador del proyecto.');
      }
    }

    await this.projectRepository.removeMember(projectId, targetUserId);
  }
}
