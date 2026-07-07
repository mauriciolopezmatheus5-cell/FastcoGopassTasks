import { v4 as uuid } from 'uuid';
import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../../domain/ports/i-project.repository';
import { CreateProjectDto } from '../dtos/create-project.dto';

/**
 * Caso de uso: Crear un nuevo proyecto.
 * Persiste el proyecto y asigna al creador como ADMIN automáticamente.
 */
export class CreateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  /**
   * Crea el proyecto y agrega al creador como miembro ADMIN.
   *
   * @param dto - Datos del nuevo proyecto (nombre y descripción)
   * @param creatorId - ID del usuario autenticado que crea el proyecto
   * @returns La entidad Project recién creada
   */
  async execute(dto: CreateProjectDto, creatorId: string): Promise<Project> {
    const now = new Date();
    const project = new Project(uuid(), now, dto.name, dto.description ?? null, now);

    const savedProject = await this.projectRepository.save(project);
    await this.projectRepository.addMember(savedProject.id, creatorId, 'ADMIN');

    return savedProject;
  }
}
