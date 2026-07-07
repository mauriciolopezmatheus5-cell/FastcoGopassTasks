import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { ITaskRepository } from '../../domain/ports/i-task.repository';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { mapTaskToDto } from '../map-task-to-dto.helper';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Obtener una tarea por su ID.
 * Verifica que el usuario sea miembro del proyecto padre.
 */
export class GetTaskByIdUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtiene los detalles de una tarea incluyendo miembros asignados y work logs.
   *
   * @param taskId - UUID de la tarea a buscar
   * @param requesterId - ID del usuario que realiza la solicitud
   * @returns DTO de respuesta con la tarea completa
   * @throws RecursoNoEncontradoException si la tarea no existe
   * @throws ReglaNegocioException si el usuario no es miembro del proyecto
   */
  async execute(taskId: string, requesterId: string): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new RecursoNoEncontradoException('tarea', taskId);
    }

    const membership = await this.prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId: requesterId },
    });
    if (!membership) {
      throw new ReglaNegocioException('No tienes acceso a esta tarea.');
    }

    const [members, workLogs] = await Promise.all([
      this.taskRepository.findMembers(taskId),
      this.taskRepository.getWorkLogs(taskId),
    ]);

    return mapTaskToDto(task, members, workLogs);
  }
}
