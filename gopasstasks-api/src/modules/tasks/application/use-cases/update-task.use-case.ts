import { ITaskRepository } from '../../domain/ports/i-task.repository';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { mapTaskToDto } from '../map-task-to-dto.helper';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Actualizar los datos de una tarea.
 * Las tareas en estado APROBADO no se pueden modificar.
 */
export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * Actualiza los campos de una tarea existente.
   *
   * @param taskId - UUID de la tarea a actualizar
   * @param dto - Datos parciales a actualizar
   * @returns DTO de respuesta con la tarea actualizada
   * @throws RecursoNoEncontradoException si la tarea no existe
   * @throws ReglaNegocioException si la tarea está en estado APROBADO
   */
  async execute(taskId: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new RecursoNoEncontradoException('tarea', taskId);
    }

    if (task.status === TaskStatus.APROBADO) {
      throw new ReglaNegocioException('No se puede modificar una tarea que ya está aprobada.');
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.estimatedTimeMin !== undefined) task.estimatedTimeMin = dto.estimatedTimeMin;
    if (dto.startDate !== undefined) task.startDate = new Date(dto.startDate);
    if (dto.dueDate !== undefined) task.dueDate = new Date(dto.dueDate);
    task.updatedAt = new Date();

    const updated = await this.taskRepository.update(task);
    const members = await this.taskRepository.findMembers(taskId);
    const workLogs = await this.taskRepository.getWorkLogs(taskId);

    return mapTaskToDto(updated, members, workLogs);
  }
}
