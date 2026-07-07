import { TaskEntity } from '../domain/entities/task.entity';
import { TaskResponseDto } from './dtos/task-response.dto';
import { WorkLogEntry } from '../domain/ports/i-task.repository';

/**
 * Convierte una TaskEntity más datos auxiliares a TaskResponseDto.
 *
 * @param task - Entidad de dominio de la tarea
 * @param members - Miembros asignados a la tarea
 * @param workLogs - Registros de trabajo para calcular el total de minutos
 */
export function mapTaskToDto(
  task: TaskEntity,
  members: { userId: string; name: string; email: string }[],
  workLogs: WorkLogEntry[],
): TaskResponseDto {
  const dto = new TaskResponseDto();
  dto.id = task.id;
  dto.projectId = task.projectId;
  dto.title = task.title;
  dto.description = task.description;
  dto.status = task.status;
  dto.priority = task.priority;
  dto.startDate = task.startDate;
  dto.dueDate = task.dueDate;
  dto.endDate = task.endDate;
  dto.estimatedTimeMin = task.estimatedTimeMin;
  dto.assignedMembers = members;
  dto.workLogTotal = workLogs.reduce((sum, log) => sum + log.timeSpentMinutes, 0);
  dto.createdAt = task.createdAt;
  dto.updatedAt = task.updatedAt;
  return dto;
}
