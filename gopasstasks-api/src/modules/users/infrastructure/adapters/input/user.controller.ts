import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma.service';
import { UserProfileDto } from '../../../application/dtos/user-profile.dto';
import { UpdateProfileDto } from '../../../application/dtos/update-profile.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

/**
 * Controlador REST del módulo de usuarios.
 * Versión v1 — Ruta base: /api/v1/users
 *
 * Expone el perfil del usuario autenticado y permite actualizarlo.
 * No contiene lógica de negocio compleja — delega directamente en Prisma
 * al tratarse de operaciones simples de perfil propio.
 */
@ApiTags('Usuarios')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/v1/users/me
   * Retorna el perfil completo del usuario autenticado, sin passwordHash.
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async getMe(@Req() req: AuthenticatedRequest): Promise<UserProfileDto> {
    const usuario = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role.name,
      createdAt: usuario.createdAt,
    };
  }

  /**
   * PATCH /api/v1/users/me
   * Actualiza el nombre del usuario autenticado.
   */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado.', type: UserProfileDto })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const usuario = await this.prisma.user.update({
      where: { id: req.user.userId },
      data: { name: dto.name },
      include: { role: true },
    });

    return {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      role: usuario.role.name,
      createdAt: usuario.createdAt,
    };
  }
}
