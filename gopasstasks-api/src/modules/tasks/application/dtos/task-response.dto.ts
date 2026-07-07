import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';

/** DTO de respuesta con los datos de una tarea. */
export class TaskResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: TaskStatus })
  status!: TaskStatus;

  @ApiProperty()
  priority!: number;

  @ApiPropertyOptional({ nullable: true })
  startDate!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  dueDate!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  endDate!: Date | null;

  @ApiProperty()
  estimatedTimeMin!: number;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  assignedMembers!: { userId: string; name: string; email: string }[];

  @ApiProperty({ description: 'Total de minutos registrados en work logs' })
  workLogTotal!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
