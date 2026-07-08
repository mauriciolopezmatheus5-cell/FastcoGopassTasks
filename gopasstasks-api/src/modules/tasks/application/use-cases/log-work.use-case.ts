import { ITaskRepository, WorkLogEntry } from '../../domain/ports/i-task.repository';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';
import { LogWorkDto } from '../dtos/log-work.dto';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Registrar tiempo trabajado en una tarea.
 * El usuario debe ser miembro asignado a la tarea y esta no debe estar APROBADA.
 */
export class LogWorkUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * Registra un work log para una tarea.
   *
   * @param taskId - UUID de la tarea
   * @param userId - ID del usuario que registra el tiempo
   * @param dto - Datos del registro (tiempo y descripción opcional)
   * @returns El work log recién creado
   * @throws RecursoNoEncontradoException si la tarea no existe
   * @throws ReglaNegocioException si la tarea está APROBADA o el usuario no es miembro
   */
  async execute(taskId: string, userId: string, dto: LogWorkDto): Promise<WorkLogEntry> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new RecursoNoEncontradoException('tarea', taskId);
    }

    if (task.status === TaskStatus.COMPLETADA) {
      throw new ReglaNegocioException(
        'No se puede registrar tiempo en una tarea que ya está completada.',
      );
    }

    const isMember = await this.taskRepository.isMember(taskId, userId);
    if (!isMember) {
      throw new ReglaNegocioException(
        'Solo los miembros asignados a la tarea pueden registrar tiempo.',
      );
    }

    return this.taskRepository.addWorkLog(taskId, userId, dto.timeSpentMinutes, dto.description);
  }
}
