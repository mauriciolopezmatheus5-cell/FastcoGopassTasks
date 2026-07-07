import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
import { GetTasksByProjectUseCase } from '../../../application/use-cases/get-tasks-by-project.use-case';
import { TaskResponseDto } from '../../../application/dtos/task-response.dto';
import { TaskStatus } from '../../../domain/value-objects/task-status.vo';

/**
 * Controlador para la ruta GET /api/v1/projects/:projectId/tasks.
 * Separado del TaskController para mantener la coherencia de rutas REST.
 */
@ApiTags('Tareas')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller({ path: 'projects', version: '1' })
@UseGuards(JwtAuthGuard)
export class ProjectTasksController {
  constructor(
    private readonly getTasksByProjectUseCase: GetTasksByProjectUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar tareas de un proyecto con filtros opcionales' })
  @ApiResponse({ status: 200, description: 'Lista de tareas', type: [TaskResponseDto] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'priority', required: false, type: Number, description: 'Filtrar por prioridad' })
  @Get(':projectId/tasks')
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: string,
  ): Promise<TaskResponseDto[]> {
    const filters: { status?: TaskStatus; priority?: number } = {};
    if (status !== undefined) filters.status = status;
    if (priority !== undefined) filters.priority = parseInt(priority, 10);
    return this.getTasksByProjectUseCase.execute(projectId, filters);
  }
}
