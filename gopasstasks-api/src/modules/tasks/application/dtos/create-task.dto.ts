import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO para la creación de una nueva tarea. */
export class CreateTaskDto {
  @ApiProperty({ description: 'Título de la tarea', minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres.' })
  title!: string;

  @ApiPropertyOptional({ description: 'Descripción de la tarea', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La descripción no puede superar los 1000 caracteres.' })
  description?: string;

  @ApiProperty({ description: 'ID del proyecto al que pertenece la tarea' })
  @IsString()
  @IsNotEmpty({ message: 'El ID del proyecto es obligatorio.' })
  projectId!: string;

  @ApiPropertyOptional({ description: 'Prioridad de la tarea (-100 a 100)', default: 0 })
  @IsOptional()
  @IsInt({ message: 'La prioridad debe ser un número entero.' })
  @Min(-100, { message: 'La prioridad mínima es -100.' })
  @Max(100, { message: 'La prioridad máxima es 100.' })
  priority?: number;

  @ApiPropertyOptional({ description: 'Tiempo estimado en minutos', minimum: 0 })
  @IsOptional()
  @IsInt({ message: 'El tiempo estimado debe ser un número entero.' })
  @Min(0, { message: 'El tiempo estimado no puede ser negativo.' })
  estimatedTimeMin?: number;

  @ApiPropertyOptional({ description: 'Fecha de inicio (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida.' })
  startDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida.' })
  dueDate?: string;
}
