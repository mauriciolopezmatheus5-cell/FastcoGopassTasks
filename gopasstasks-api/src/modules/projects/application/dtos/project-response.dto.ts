import { ApiProperty } from '@nestjs/swagger';

/** DTO de respuesta para un proyecto. */
export class ProjectResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() memberCount: number;
  @ApiProperty() taskCount: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
