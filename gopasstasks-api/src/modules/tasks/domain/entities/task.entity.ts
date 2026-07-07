import { TaskStatus } from '../value-objects/task-status.vo';

/**
 * Entidad de dominio Task.
 * Representa una tarea dentro de un proyecto.
 * No depende de ningún framework ni ORM.
 */
export class TaskEntity {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public priority: number,
    public startDate: Date | null,
    public dueDate: Date | null,
    public endDate: Date | null,
    public estimatedTimeMin: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}
}
