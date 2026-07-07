import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** DTO para actualizar un proyecto existente. Todos los campos son opcionales. */
export class UpdateProjectDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre del proyecto', minLength: 3, maxLength: 100 })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsOptional()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  readonly name?: string;

  @ApiPropertyOptional({ description: 'Nueva descripción del proyecto', maxLength: 500 })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres.' })
  readonly description?: string;
}
