import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
import { CreateProjectUseCase } from '../../../application/use-cases/create-project.use-case';
import { GetProjectsUseCase } from '../../../application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from '../../../application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from '../../../application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from '../../../application/use-cases/delete-project.use-case';
import { AddProjectMemberUseCase } from '../../../application/use-cases/add-project-member.use-case';
import { RemoveProjectMemberUseCase } from '../../../application/use-cases/remove-project-member.use-case';
import { GetProjectMembersUseCase } from '../../../application/use-cases/get-project-members.use-case';
import { CreateProjectDto } from '../../../application/dtos/create-project.dto';
import { UpdateProjectDto } from '../../../application/dtos/update-project.dto';
import { AddMemberDto } from '../../../application/dtos/add-member.dto';
import { ProjectResponseDto } from '../../../application/dtos/project-response.dto';
import { ProjectMemberResponseDto } from '../../../application/dtos/project-member-response.dto';
import {
  RecursoNoEncontradoException,
  ReglaNegocioException,
  RecursoDuplicadoException,
} from '../../../../../shared/domain/exceptions';

/** Forma del usuario autenticado extraída del JWT por JwtStrategy. */
interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

/**
 * Controlador REST del módulo de proyectos.
 * Versión v1 — Ruta base: /api/v1/projects
 *
 * Adaptador de entrada: traduce peticiones HTTP a llamadas a los casos de uso.
 * No contiene lógica de negocio.
 */
@ApiTags('Proyectos')
@ApiCookieAuth('access_token')
@ApiBearerAuth()
@Controller({ path: 'projects', version: '1' })
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectsUseCase: GetProjectsUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly addProjectMemberUseCase: AddProjectMemberUseCase,
    private readonly removeProjectMemberUseCase: RemoveProjectMemberUseCase,
    private readonly getProjectMembersUseCase: GetProjectMembersUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar proyectos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos', type: [ProjectResponseDto] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @Get()
  async findAll(@Request() req: AuthenticatedRequest): Promise<ProjectResponseDto[]> {
    return this.getProjectsUseCase.execute(req.user.userId);
  }

  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiResponse({ status: 201, description: 'Proyecto creado', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ id: string; name: string; description: string | null; createdAt: Date }> {
    const project = await this.createProjectUseCase.execute(dto, req.user.userId);
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
    };
  }

  @ApiOperation({ summary: 'Obtener un proyecto por ID' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado', type: ProjectResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin acceso al proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProjectResponseDto> {
    try {
      return await this.getProjectByIdUseCase.execute(id, req.user.userId);
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

  @ApiOperation({ summary: 'Actualizar un proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No eres ADMIN del proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ id: string; name: string; description: string | null; updatedAt: Date }> {
    try {
      const project = await this.updateProjectUseCase.execute(id, dto, req.user.userId);
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        updatedAt: project.updatedAt,
      };
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

  @ApiOperation({ summary: 'Eliminar un proyecto' })
  @ApiResponse({ status: 204, description: 'Proyecto eliminado' })
  @ApiResponse({ status: 403, description: 'No eres ADMIN del proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    try {
      await this.deleteProjectUseCase.execute(id, req.user.userId);
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

  @ApiOperation({ summary: 'Agregar un miembro al proyecto' })
  @ApiResponse({ status: 201, description: 'Miembro agregado' })
  @ApiResponse({ status: 403, description: 'No eres ADMIN del proyecto' })
  @ApiResponse({ status: 409, description: 'El usuario ya es miembro' })
  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ mensaje: string }> {
    try {
      await this.addProjectMemberUseCase.execute(id, dto, req.user.userId);
      return { mensaje: 'Miembro agregado correctamente.' };
    } catch (error) {
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof RecursoDuplicadoException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Remover un miembro del proyecto' })
  @ApiResponse({ status: 204, description: 'Miembro removido' })
  @ApiResponse({ status: 403, description: 'No eres ADMIN o es el último ADMIN' })
  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    try {
      await this.removeProjectMemberUseCase.execute(id, userId, req.user.userId);
    } catch (error) {
      if (error instanceof ReglaNegocioException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Listar miembros del proyecto' })
  @ApiResponse({ status: 200, description: 'Lista de miembros', type: [ProjectMemberResponseDto] })
  @ApiResponse({ status: 403, description: 'Sin acceso al proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  @Get(':id/members')
  async getMembers(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProjectMemberResponseDto[]> {
    try {
      return await this.getProjectMembersUseCase.execute(id, req.user.userId);
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
