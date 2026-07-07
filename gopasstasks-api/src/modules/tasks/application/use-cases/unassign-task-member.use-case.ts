import { ITaskRepository } from '../../domain/ports/i-task.repository';
import { RecursoNoEncontradoException } from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Desasignar un usuario de una tarea.
 */
export class UnassignTaskMemberUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  /**
   * Remueve la asignación de un usuario en la tarea.
   *
   * @param taskId - UUID de la tarea
   * @param userId - ID del usuario a desasignar
   * @throws RecursoNoEncontradoException si la tarea no existe
   */
  async execute(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new RecursoNoEncontradoException('tarea', taskId);
    }

    await this.taskRepository.removeMember(taskId, userId);
  }
}
