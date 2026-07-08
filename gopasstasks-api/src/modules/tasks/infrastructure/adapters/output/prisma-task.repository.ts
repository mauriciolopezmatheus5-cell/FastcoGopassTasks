import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma.service';
import {
  ITaskRepository,
  WorkLogEntry,
} from '../../../domain/ports/i-task.repository';
import { TaskEntity } from '../../../domain/entities/task.entity';
import { TaskStatus } from '../../../domain/value-objects/task-status.vo';
import { RecursoNoEncontradoException } from '../../../../../shared/domain/exceptions';

/**
 * Tipo guard para verificar si un error es un PrismaClientKnownRequestError.
 */
function isPrismaClientKnownRequestError(error: unknown): error is { code: string; message: string } {
  if (!(error instanceof Error)) return false;
  const err = error as unknown as { code?: unknown; message?: string };
  return typeof err.code === 'string' && typeof err.message === 'string';
}

/**
 * Adaptador de salida (Output Adapter): implementa ITaskRepository con Prisma ORM.
 * Es la única clase del módulo de tareas que conoce Prisma.
 */
@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** {@inheritdoc ITaskRepository.findById} */
  async findById(id: string): Promise<TaskEntity | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    return task ? this.mapToDomain(task) : null;
  }

  /** {@inheritdoc ITaskRepository.findByProject} */
  async findByProject(
    projectId: string,
    filters?: { status?: TaskStatus; priority?: number },
  ): Promise<TaskEntity[]> {
    const where = { projectId } as Record<string, unknown>;

    if (filters?.status !== undefined) {
      where.status = filters.status;
    }
    if (filters?.priority !== undefined) {
      where.priority = filters.priority;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((t) => this.mapToDomain(t));
  }

  /** {@inheritdoc ITaskRepository.save} */
  async save(task: TaskEntity): Promise<TaskEntity> {
    const created = await this.prisma.task.create({
      data: {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status as any,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        endDate: task.endDate,
        estimatedTimeMin: task.estimatedTimeMin,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });
    return this.mapToDomain(created);
  }

  /** {@inheritdoc ITaskRepository.update} */
  async update(task: TaskEntity): Promise<TaskEntity> {
    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status as any,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        endDate: task.endDate,
        estimatedTimeMin: task.estimatedTimeMin,
        updatedAt: task.updatedAt,
      },
    });
    return this.mapToDomain(updated);
  }

  /** {@inheritdoc ITaskRepository.delete} */
  async delete(id: string): Promise<void> {
    try {
      // Eliminar registros relacionados antes de borrar la tarea
      // (las FK no tienen CASCADE en la BD, se gestiona aquí)
      await this.prisma.$transaction([
        this.prisma.taskMember.deleteMany({ where: { taskId: id } }),
        this.prisma.taskWorkLog.deleteMany({ where: { taskId: id } }),
        this.prisma.taskDescriptionHistory.deleteMany({ where: { taskId: id } }),
        this.prisma.task.delete({ where: { id } }),
      ]);
    } catch (error) {
      if (isPrismaClientKnownRequestError(error) && error.code === 'P2025') {
        throw new RecursoNoEncontradoException('tarea', id);
      }
      throw error;
    }
  }

  /** {@inheritdoc ITaskRepository.findMembers} */
  async findMembers(
    taskId: string,
  ): Promise<{ userId: string; name: string; email: string }[]> {
    const members = await this.prisma.taskMember.findMany({
      where: { taskId },
      include: { user: true },
    });

    return members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
    }));
  }

  /** {@inheritdoc ITaskRepository.addMember} */
  async addMember(taskId: string, userId: string): Promise<void> {
    await this.prisma.taskMember.upsert({
      where: { taskId_userId: { taskId, userId } },
      update: {},
      create: { taskId, userId },
    });
  }

  /** {@inheritdoc ITaskRepository.removeMember} */
  async removeMember(taskId: string, userId: string): Promise<void> {
    await this.prisma.taskMember.deleteMany({
      where: { taskId, userId },
    });
  }

  /** {@inheritdoc ITaskRepository.isMember} */
  async isMember(taskId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.taskMember.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    return member !== null;
  }

  /** {@inheritdoc ITaskRepository.addWorkLog} */
  async addWorkLog(
    taskId: string,
    userId: string,
    timeSpentMinutes: number,
    description?: string,
  ): Promise<WorkLogEntry> {
    const log = await this.prisma.taskWorkLog.create({
      data: {
        taskId,
        userId,
        timeSpent: timeSpentMinutes,
        description: description ?? null,
      },
      include: { user: true },
    });

    return {
      id: log.id,
      taskId: log.taskId,
      userId: log.userId,
      userName: log.user.name,
      timeSpentMinutes: log.timeSpent,
      description: log.description,
      recordedAt: log.recordedAt,
    };
  }

  /** {@inheritdoc ITaskRepository.getWorkLogs} */
  async getWorkLogs(taskId: string): Promise<WorkLogEntry[]> {
    const logs = await this.prisma.taskWorkLog.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { recordedAt: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      taskId: log.taskId,
      userId: log.userId,
      userName: log.user.name,
      timeSpentMinutes: log.timeSpent,
      description: log.description,
      recordedAt: log.recordedAt,
    }));
  }

  /** {@inheritdoc ITaskRepository.saveDescriptionHistory} */
  async saveDescriptionHistory(taskId: string, description: string): Promise<void> {
    await this.prisma.taskDescriptionHistory.create({
      data: { taskId, description },
    });
  }

  /**
   * Mapea un modelo de Prisma a la entidad de dominio TaskEntity.
   * Mantiene el dominio libre de tipos generados por el ORM.
   */
  private mapToDomain(prismaTask: {
    id: string;
    projectId: string;
    title: string;
    description: string | null;
    status: any;
    priority: number;
    startDate: Date | null;
    dueDate: Date | null;
    endDate: Date | null;
    estimatedTimeMin: number;
    createdAt: Date;
    updatedAt: Date;
  }): TaskEntity {
    return new TaskEntity(
      prismaTask.id,
      prismaTask.projectId,
      prismaTask.title,
      prismaTask.description,
      prismaTask.status as TaskStatus,
      prismaTask.priority,
      prismaTask.startDate,
      prismaTask.dueDate,
      prismaTask.endDate,
      prismaTask.estimatedTimeMin,
      prismaTask.createdAt,
      prismaTask.updatedAt,
    );
  }
}
