import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  ForbiddenException,
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
import { CreateTaskUseCase } from '../../../application/use-cases/create-task.use-case';
import { GetTaskByIdUseCase } from '../../../application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from '../../../application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '../../../application/use-cases/delete-task.use-case';
import { ChangeTaskStatusUseCase } from '../../../application/use-cases/change-task-status.use-case';
import { AssignTaskMemberUseCase } from '../../../application/use-cases/assign-task-member.use-case';
import { UnassignTaskMemberUseCase } from '../../../application/use-cases/unassign-task-member.use-case';
import { LogWorkUseCase } from '../../../application/use-cases/log-work.use-case';
import { GetWorkLogsUseCase } from '../../../application/use-cases/get-work-logs.use-case';
import { CreateTaskDto } from '../../../application/dtos/create-task.dto';
import { UpdateTaskDto } from '../../../application/dtos/update-task.dto';
import { ChangeTaskStatusDto } from '../../../application/dtos/change-status.dto';
import { AssignMemberDto } from '../../../application/dtos/assign-member.dto';
import { LogWorkDto } from '../../../application/dtos/log-work.dto';
import { TaskResponseDto } from '../../../application/dtos/task-response.dto';
import { WorkLogEntry } from '../../../domain/ports/i-task.repository';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
} from '../../../../../shared/domain/exceptions';

/** Forma del usuario autenticado extraída del JWT por JwtStrategy. */
interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

/**
 * Controlador REST del módulo de tareas.
 * Versión v1 — Ruta base: /api/v1/tasks
 *
 * Adaptador de entrada: traduce peticiones HTTP a llamadas a los casos de uso.
 * No contiene lógica de negocio.
 */
@ApiTags('Tareas')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller({ path: 'tasks', version: '1' })
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly changeTaskStatusUseCase: ChangeTaskStatusUseCase,
    private readonly assignTaskMemberUseCase: AssignTaskMemberUseCase,
    private readonly unassignTaskMemberUseCase: UnassignTaskMemberUseCase,
    private readonly logWorkUseCase: LogWorkUseCase,
    private readonly getWorkLogsUseCase: GetWorkLogsUseCase,
  ) {}

  @ApiOperation({ summary: 'Crear una nueva tarea en un proyecto' })
  @ApiResponse({ status: 201, description: 'Tarea creada', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No eres miembro del proyecto' })
  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TaskResponseDto> {
    try {
      return await this.createTaskUseCase.execute(dto, req.user.userId);
    } catch (error) {
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada', type: TaskResponseDto })
  @ApiResponse({ status: 403, description: 'Sin acceso a la tarea' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<TaskResponseDto> {
    try {
      return await this.getTaskByIdUseCase.execute(id, req.user.userId);
    } catch (error) {
      if (error instanceof RecursoNoEncontradoException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Tarea en estado APROBADO' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    try {
      return await this.updateTaskUseCase.execute(id, dto);
    } catch (error) {
      if (error instanceof RecursoNoEncontradoException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Cambiar el estado de una tarea' })
  @ApiResponse({ status: 200, description: 'Estado actualizado', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeTaskStatusDto,
  ): Promise<TaskResponseDto> {
    try {
      return await this.changeTaskStatusUseCase.execute(id, dto);
    } catch (error) {
      if (error instanceof RecursoNoEncontradoException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Asignar un usuario a una tarea' })
  @ApiResponse({ status: 201, description: 'Usuario asignado' })
  @ApiResponse({ status: 403, description: 'Tarea APROBADA o usuario no es miembro del proyecto' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @Post(':id/assign')
  async assignMember(
    @Param('id') id: string,
    @Body() dto: AssignMemberDto,
  ): Promise<{ assignedMembers: { userId: string; name: string; email: string }[] }> {
    try {
      const assignedMembers = await this.assignTaskMemberUseCase.execute(id, dto.userId);
      return { assignedMembers };
    } catch (error) {
      if (error instanceof RecursoNoEncontradoException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Desasignar un usuario de una tarea' })
  @ApiResponse({ status: 204, description: 'Usuario desasignado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @Delete(':id/assign/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    try {
      await this.unassignTaskMemberUseCase.execute(id, userId);
    } catch (error) {
      if (error instanceof RecursoNoEncontradoException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Registrar tiempo trabajado en una tarea' })
  @ApiResponse({ status: 201, description: 'Registro creado' })
  @ApiResponse({ status: 403, description: 'Tarea APROBADA o usuario no asignado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @Post(':id/work-logs')
  async logWork(
    @Param('id') id: string,
    @Body() dto: LogWorkDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<WorkLogEntry> {
    try {
      return await this.logWorkUseCase.execute(id, req.user.userId, dto);
    } catch (error) {
      if (error instanceof RecursoNoEncontradoException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Listar registros de trabajo de una tarea' })
  @ApiResponse({ status: 200, description: 'Lista de work logs' })
  @ApiQuery({ name: 'id', description: 'ID de la tarea' })
  @Get(':id/work-logs')
  async getWorkLogs(@Param('id') id: string): Promise<WorkLogEntry[]> {
    return this.getWorkLogsUseCase.execute(id);
  }

  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiResponse({ status: 204, description: 'Tarea eliminada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para eliminar' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    try {
      await this.deleteTaskUseCase.execute(id, req.user.userId);
    } catch (error) {
      if (error instanceof RecursoNoEncontradoException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }
}
