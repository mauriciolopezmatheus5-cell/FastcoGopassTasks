import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';
import { IProjectRepository } from '../../domain/ports/i-project.repository';
import { ProjectResponseDto } from '../dtos/project-response.dto';

/**
 * Caso de uso: Obtener un proyecto por su ID.
 * Verifica que el usuario sea miembro antes de retornar los datos.
 */
export class GetProjectByIdUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Retorna el proyecto si existe y el usuario es miembro.
   *
   * @param id - UUID del proyecto
   * @param userId - ID del usuario autenticado
   * @returns ProjectResponseDto con conteos de miembros y tareas
   * @throws RecursoNoEncontradoException si el proyecto no existe
   * @throws ReglaNegocioException si el usuario no es miembro
   */
  async execute(id: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new RecursoNoEncontradoException('proyecto', id);
    }

    const isMember = await this.projectRepository.isUserMember(id, userId);
    if (!isMember) {
      throw new ReglaNegocioException('No tienes acceso a este proyecto.');
    }

    const [memberCount, taskCount] = await Promise.all([
      this.projectRepository.getMemberCount(id),
      this.projectRepository.getTaskCount(id),
    ]);

    const dto = new ProjectResponseDto();
    dto.id = project.id;
    dto.name = project.name;
    dto.description = project.description;
    dto.memberCount = memberCount;
    dto.taskCount = taskCount;
    dto.createdAt = project.createdAt;
    dto.updatedAt = project.updatedAt;
    return dto;
  }
}
