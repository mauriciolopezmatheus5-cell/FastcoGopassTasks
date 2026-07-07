import { ITaskRepository } from '../../domain/ports/i-task.repository';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { mapTaskToDto } from '../map-task-to-dto.helper';

/**
 * Caso de uso: Listar tareas de un proyecto con filtros opcionales.
 */
export class GetTasksByProjectUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * Obtiene las tareas de un proyecto aplicando filtros opcionales.
   *
   * @param projectId - ID del proyecto cuyas tareas se listan
   * @param filters - Filtros opcionales: estado y/o prioridad
   * @returns Array de DTOs de respuesta
   */
  async execute(
    projectId: string,
    filters?: { status?: TaskStatus; priority?: number },
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findByProject(projectId, filters);
    return tasks.map((task) => mapTaskToDto(task, [], []));
  }
}
