import { ITaskRepository, WorkLogEntry } from '../../domain/ports/i-task.repository';

/**
 * Caso de uso: Obtener los registros de trabajo de una tarea.
 */
export class GetWorkLogsUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * Lista todos los work logs de una tarea ordenados por fecha descendente.
   *
   * @param taskId - UUID de la tarea
   * @returns Array de registros de trabajo
   */
  async execute(taskId: string): Promise<WorkLogEntry[]> {
    return this.taskRepository.getWorkLogs(taskId);
  }
}
