import { IProjectRepository } from '../../domain/ports/i-project.repository';
import { ProjectResponseDto } from '../dtos/project-response.dto';

/**
 * Caso de uso: Listar todos los proyectos del usuario autenticado.
 * Solo retorna proyectos en los que el usuario es miembro.
 */
export class GetProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Obtiene los proyectos del usuario con conteos de miembros y tareas.
   *
   * @param userId - ID del usuario autenticado
   * @returns Lista de proyectos con sus conteos
   */
  async execute(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepository.findAll(userId);

    const result = await Promise.all(
      projects.map(async (project) => {
        const [memberCount, taskCount] = await Promise.all([
          this.projectRepository.getMemberCount(project.id),
          this.projectRepository.getTaskCount(project.id),
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
      }),
    );

    return result;
  }
}
