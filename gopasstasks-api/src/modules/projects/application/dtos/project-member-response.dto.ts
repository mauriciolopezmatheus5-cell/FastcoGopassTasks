import { ApiProperty } from '@nestjs/swagger';

/** DTO de respuesta para un miembro del proyecto. */
export class ProjectMemberResponseDto {
  @ApiProperty() userId: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() role: string;
  @ApiProperty() joinedAt: Date;
}
