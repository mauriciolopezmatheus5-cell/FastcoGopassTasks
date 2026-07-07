import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../shared/guards/roles.guard';
import { Roles } from '../../../../../shared/guards/roles.decorator';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case';
import { ChangeUserRoleUseCase } from '../../../application/use-cases/change-user-role.use-case';
import { DeactivateUserUseCase } from '../../../application/use-cases/deactivate-user.use-case';
import { GetRolesUseCase } from '../../../application/use-cases/get-roles.use-case';
import { GetRoleByIdUseCase } from '../../../application/use-cases/get-role-by-id.use-case';

class ChangeRoleDto {
  @IsUUID('4', { message: 'El roleId debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El roleId es obligatorio.' })
  roleId!: string;
}

@ApiTags('Admin')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar todos los usuarios (solo ADMIN)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'roleId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuarios' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo ADMIN' })
  @Get('users')
  async getUsers(@Query() query: { page?: string; limit?: string; roleId?: string }) {
    return this.getUsersUseCase.execute({
      page: Number(query.page) || 1,
      limit: Math.min(Number(query.limit) || 10, 100),
      roleId: query.roleId,
    });
  }

  @ApiOperation({ summary: 'Obtener usuario por ID con proyectos (solo ADMIN)' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Detalle del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get('users/:id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUserByIdUseCase.execute(id);
  }

  @ApiOperation({ summary: 'Cambiar rol de un usuario (solo ADMIN)' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Rol actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'No se puede cambiar el único ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Patch('users/:id/role')
  async changeUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
  ) {
    await this.changeUserRoleUseCase.execute(id, dto.roleId);
    return { mensaje: 'Rol del usuario actualizado correctamente.' };
  }

  @ApiOperation({ summary: 'Desactivar usuario (solo ADMIN)' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado' })
  @ApiResponse({ status: 400, description: 'No se puede desactivar el único ADMIN' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @HttpCode(HttpStatus.OK)
  @Delete('users/:id')
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.deactivateUserUseCase.execute(id);
    return { mensaje: 'Usuario desactivado correctamente.' };
  }

  @ApiOperation({ summary: 'Listar todos los roles disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  @Get('roles')
  async getRoles() {
    return this.getRolesUseCase.execute();
  }

  @ApiOperation({ summary: 'Obtener detalle de un rol con sus usuarios' })
  @ApiParam({ name: 'id', type: String, description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Detalle del rol' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @Get('roles/:id')
  async getRoleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.getRoleByIdUseCase.execute(id);
  }
}
