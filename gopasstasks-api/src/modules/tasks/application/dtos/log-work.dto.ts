import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO para registrar tiempo trabajado en una tarea. */
export class LogWorkDto {
  @ApiProperty({ description: 'Minutos trabajados (mínimo 1)', minimum: 1 })
  @IsInt({ message: 'El tiempo debe ser un número entero.' })
  @Min(1, { message: 'El tiempo mínimo es 1 minuto.' })
  timeSpentMinutes!: number;

  @ApiPropertyOptional({ description: 'Descripción del trabajo realizado', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres.' })
  description?: string;
}
