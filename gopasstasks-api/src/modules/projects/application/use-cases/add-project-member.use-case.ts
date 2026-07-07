import { ReglaNegocioException } from '../../../../shared/domain/exceptions';
import { IProjectRepository } from '../../domain/ports/i-project.repository';
import { AddMemberDto } from '../dtos/add-member.dto';

/**
 * Caso de uso: Agregar un miembro a un proyecto.
 * Solo el ADMIN del proyecto puede agregar miembros.
 */
export class AddProjectMemberUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Agrega un usuario como miembro del proyecto con el rol indicado.
   *
   * @param projectId - ID del proyecto
   * @param dto - Datos del nuevo miembro (userId y rol opcional)
   * @param requesterId - ID del usuario que realiza la acción
   * @throws ReglaNegocioException si el solicitante no es ADMIN del proyecto
   * @throws RecursoDuplicadoException si el usuario ya es miembro (lanzado por el repositorio)
   */
  async execute(projectId: string, dto: AddMemberDto, requesterId: string): Promise<void> {
    const requesterRole = await this.projectRepository.getUserRole(projectId, requesterId);
    if (requesterRole !== 'ADMIN') {
      throw new ReglaNegocioException('Solo el administrador puede agregar miembros al proyecto.');
    }

    await this.projectRepository.addMember(projectId, dto.userId, dto.role ?? 'MEMBER');
  }
}
