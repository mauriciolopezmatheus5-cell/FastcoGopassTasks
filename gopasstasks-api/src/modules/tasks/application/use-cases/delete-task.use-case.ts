import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { ITaskRepository } from '../../domain/ports/i-task.repository';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Eliminar una tarea.
 * Solo puede eliminar quien sea ADMIN del proyecto o miembro asignado a la tarea.
 */
export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Elimina la tarea si el usuario tiene permisos suficientes.
   *
   * @param taskId - UUID de la tarea a eliminar
   * @param requesterId - ID del usuario que solicita la eliminación
   * @throws RecursoNoEncontradoException si la tarea no existe
   * @throws ReglaNegocioException si el usuario no tiene permisos
   */
  async execute(taskId: string, requesterId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new RecursoNoEncontradoException('tarea', taskId);
    }

    const projectMember = await this.prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: requesterId },
    });

    const isProjectAdmin = projectMember?.role === 'ADMIN';
    const isTaskMember = await this.taskRepository.isMember(taskId, requesterId);

    if (!isProjectAdmin && !isTaskMember) {
      throw new ReglaNegocioException(
        'Solo el ADMIN del proyecto o un miembro asignado puede eliminar esta tarea.',
      );
    }

    await this.taskRepository.delete(taskId);
  }
}
