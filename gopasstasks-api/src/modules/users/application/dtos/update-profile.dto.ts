import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO para actualizar el perfil del usuario autenticado.
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre del usuario', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  name?: string;
}
