import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta con el perfil del usuario autenticado.
 * Nunca expone el campo passwordHash.
 */
export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;
}
