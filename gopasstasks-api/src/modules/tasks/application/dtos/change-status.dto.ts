import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';

/** DTO para el cambio de estado de una tarea. */
export class ChangeTaskStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la tarea',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus, {
    message: `El estado debe ser uno de: ${Object.values(TaskStatus).join(', ')}.`,
  })
  status!: TaskStatus;
}
