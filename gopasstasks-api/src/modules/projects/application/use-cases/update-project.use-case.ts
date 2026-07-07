import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';
import { IProjectRepository } from '../../domain/ports/i-project.repository';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectDto } from '../dtos/update-project.dto';

/**
 * Caso de uso: Actualizar nombre o descripción de un proyecto.
 * Solo el miembro con rol ADMIN puede modificar el proyecto.
 */
export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Actualiza los campos presentes en el DTO.
   *
   * @param id - UUID del proyecto a actualizar
   * @param dto - Campos a actualizar (todos opcionales)
   * @param userId - ID del usuario que realiza la acción
   * @returns La entidad Project actualizada
   * @throws RecursoNoEncontradoException si el proyecto no existe
   * @throws ReglaNegocioException si el usuario no es ADMIN del proyecto
   */
  async execute(id: string, dto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new RecursoNoEncontradoException('proyecto', id);
    }

    const role = await this.projectRepository.getUserRole(id, userId);
    if (role !== 'ADMIN') {
      throw new ReglaNegocioException('Solo el administrador puede modificar el proyecto.');
    }

    if (dto.name !== undefined) {
      project.name = dto.name;
    }
    if (dto.description !== undefined) {
      project.description = dto.description;
    }
    project.updatedAt = new Date();

    return this.projectRepository.update(project);
  }
}
