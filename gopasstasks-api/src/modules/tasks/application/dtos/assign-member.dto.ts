import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO para asignar un usuario a una tarea. */
export class AssignMemberDto {
  @ApiProperty({ description: 'ID del usuario a asignar a la tarea' })
  @IsString()
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio.' })
  userId!: string;
}
