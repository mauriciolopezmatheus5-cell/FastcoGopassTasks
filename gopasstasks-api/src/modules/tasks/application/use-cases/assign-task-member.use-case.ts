import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { ITaskRepository } from '../../domain/ports/i-task.repository';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Asignar un usuario a una tarea.
 * El usuario debe ser miembro del proyecto y la tarea no debe estar APROBADA.
 */
export class AssignTaskMemberUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Asigna un usuario como miembro de la tarea.
   *
   * @param taskId - UUID de la tarea
   * @param assigneeId - ID del usuario a asignar
   * @returns Lista actualizada de miembros de la tarea
   * @throws RecursoNoEncontradoException si la tarea no existe
   * @throws ReglaNegocioException si la tarea está APROBADA o el usuario no es miembro del proyecto
   */
  async execute(
    taskId: string,
    assigneeId: string,
  ): Promise<{ userId: string; name: string; email: string }[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new RecursoNoEncontradoException('tarea', taskId);
    }

    if (task.status === TaskStatus.COMPLETADA) {
      throw new ReglaNegocioException(
        'No se pueden asignar miembros a una tarea que ya está completada.',
      );
    }

    const projectMembership = await this.prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: assigneeId },
    });

    if (!projectMembership) {
      throw new ReglaNegocioException(
        'El usuario no pertenece al proyecto de esta tarea y no puede ser asignado.',
      );
    }

    await this.taskRepository.addMember(taskId, assigneeId);
    return this.taskRepository.findMembers(taskId);
  }
}
