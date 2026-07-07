import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO para agregar un miembro a un proyecto. */
export class AddMemberDto {
  @ApiProperty({ description: 'ID del usuario a agregar como miembro' })
  @IsString({ message: 'El userId debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El userId es obligatorio.' })
  readonly userId: string;

  @ApiPropertyOptional({ description: "Rol del nuevo miembro ('ADMIN' | 'MEMBER')", default: 'MEMBER' })
  @IsString({ message: 'El rol debe ser una cadena de texto.' })
  @IsOptional()
  readonly role?: string;
}
