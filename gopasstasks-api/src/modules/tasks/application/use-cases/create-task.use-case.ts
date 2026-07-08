import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { ITaskRepository } from '../../domain/ports/i-task.repository';
import { TaskEntity } from '../../domain/entities/task.entity';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { TaskResponseDto } from '../dtos/task-response.dto';
import { mapTaskToDto } from '../map-task-to-dto.helper';
import { ReglaNegocioException } from '../../../../shared/domain/exceptions';

/**
 * Caso de uso: Crear una nueva tarea en un proyecto.
 * Verifica que el creador sea miembro del proyecto antes de crear la tarea.
 */
export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Crea la tarea y la persiste en la base de datos.
   *
   * @param dto - Datos de la nueva tarea
   * @param creatorId - ID del usuario autenticado que crea la tarea
   * @returns DTO de respuesta con la tarea creada
   * @throws ReglaNegocioException si el usuario no es miembro del proyecto
   */
  async execute(dto: CreateTaskDto, creatorId: string): Promise<TaskResponseDto> {
    const membership = await this.prisma.projectMember.findFirst({
      where: { projectId: dto.projectId, userId: creatorId },
    });

    if (!membership) {
      throw new ReglaNegocioException(
        'No puedes crear tareas en un proyecto del que no eres miembro.',
      );
    }

    const now = new Date();
    const task = new TaskEntity(
      uuid(),
      dto.projectId,
      dto.title,
      dto.description ?? null,
      TaskStatus.PENDIENTE,
      dto.priority ?? 0,
      dto.startDate ? new Date(dto.startDate) : null,
      dto.dueDate ? new Date(dto.dueDate) : null,
      null,
      dto.estimatedTimeMin ?? 0,
      now,
      now,
    );

    const saved = await this.taskRepository.save(task);
    return mapTaskToDto(saved, [], []);
  }
}
