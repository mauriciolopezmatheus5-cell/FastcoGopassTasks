import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';
import { IProjectRepository } from '../../domain/ports/i-project.repository';
import { ProjectMemberResponseDto } from '../dtos/project-member-response.dto';

/**
 * Caso de uso: Listar miembros de un proyecto.
 * El solicitante debe ser miembro del proyecto para acceder a la lista.
 */
export class GetProjectMembersUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Retorna la lista de miembros del proyecto si el solicitante tiene acceso.
   *
   * @param projectId - ID del proyecto
   * @param requesterId - ID del usuario que realiza la consulta
   * @returns Lista de miembros con su rol
   * @throws RecursoNoEncontradoException si el proyecto no existe
   * @throws ReglaNegocioException si el solicitante no es miembro
   */
  async execute(projectId: string, requesterId: string): Promise<ProjectMemberResponseDto[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new RecursoNoEncontradoException('proyecto', projectId);
    }

    const isMember = await this.projectRepository.isUserMember(projectId, requesterId);
    if (!isMember) {
      throw new ReglaNegocioException('No tienes acceso a este proyecto.');
    }

    const members = await this.projectRepository.getMembers(projectId);

    return members.map((m) => {
      const dto = new ProjectMemberResponseDto();
      dto.userId = m.userId;
      dto.name = m.name;
      dto.email = m.email;
      dto.role = m.role;
      dto.joinedAt = m.joinedAt;
      return dto;
    });
  }
}
