import { ITaskRepository } from '../../domain/ports/i-task.repository';
import { TaskStatus, VALID_TRANSITIONS } from '../../domain/value-objects/task-status.vo';
import { ChangeTaskStatusDto } from '../dtos/change-status.dto';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { mapTaskToDto } from '../map-task-to-dto.helper';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Cambiar el estado de una tarea.
 * Valida que la transición sea permitida según la matriz VALID_TRANSITIONS.
 * Si el nuevo estado es APROBADO y la tarea tiene descripción, guarda el historial.
 */
export class ChangeTaskStatusUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * Cambia el estado de la tarea validando las transiciones permitidas.
   *
   * @param taskId - UUID de la tarea
   * @param dto - DTO con el nuevo estado
   * @returns DTO de respuesta con la tarea actualizada
   * @throws RecursoNoEncontradoException si la tarea no existe
   * @throws ReglaNegocioException si la transición no está permitida
   */
  async execute(taskId: string, dto: ChangeTaskStatusDto): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new RecursoNoEncontradoException('tarea', taskId);
    }

    const currentStatus = task.status;
    const newStatus = dto.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ReglaNegocioException(
        `No se puede cambiar el estado de '${currentStatus}' a '${newStatus}'. ` +
          `Transiciones permitidas: ${allowedTransitions.join(', ') || 'ninguna'}.`,
      );
    }

    // Guardar historial de descripción al aprobar
    if (newStatus === TaskStatus.APROBADO && task.description) {
      await this.taskRepository.saveDescriptionHistory(taskId, task.description);
    }

    task.status = newStatus;
    task.updatedAt = new Date();

    // Si se aprueba, marcar fecha de finalización
    if (newStatus === TaskStatus.APROBADO) {
      task.endDate = new Date();
    }

    const updated = await this.taskRepository.update(task);
    const [members, workLogs] = await Promise.all([
      this.taskRepository.findMembers(taskId),
      this.taskRepository.getWorkLogs(taskId),
    ]);

    return mapTaskToDto(updated, members, workLogs);
  }
}
