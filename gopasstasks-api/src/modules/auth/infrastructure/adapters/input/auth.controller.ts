import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../../application/use-cases/register.use-case';
import { LoginDto } from '../../../application/dtos/login.dto';
import { RegisterDto } from '../../../application/dtos/register.dto';
import { JwtAuthGuard } from '../../../../../shared/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; role: string };
}

const COOKIE_NAME = 'access_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // false en desarrollo (sin HTTPS local)
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 1000, // 1 hora
  path: '/',
};

/**
 * Controlador REST del módulo de autenticación.
 * Versión v1 — Ruta base: /api/v1/auth
 *
 * Adaptador de entrada. No contiene lógica de negocio: delega en los casos de uso.
 */
@ApiTags('Autenticación')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  /**
   * POST /api/v1/auth/login
   * Autentica al usuario y establece la cookie JWT HttpOnly.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada correctamente.' })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas o usuario inactivo.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ mensaje: string; user: { id: string; name: string; email: string; role: string; createdAt: string } }> {
    const resultado = await this.loginUseCase.execute(loginDto.email, loginDto.password);
    res.cookie(COOKIE_NAME, resultado.token, COOKIE_OPTIONS);
    return { mensaje: 'Sesión iniciada correctamente.', user: resultado.user };
  }

  /**
   * POST /api/v1/auth/logout
   * Cierra la sesión del usuario limpiando la cookie JWT.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente.' })
  logout(
    @Res({ passthrough: true }) res: Response,
  ): { mensaje: string } {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
    return { mensaje: 'Sesión cerrada correctamente.' };
  }

  /**
   * POST /api/v1/auth/register
   * Registra un nuevo usuario con rol DEVELOPER por defecto.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado correctamente.' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado.' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ mensaje: string; userId: string }> {
    const user = await this.registerUseCase.execute(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );
    return { mensaje: 'Usuario registrado correctamente.', userId: user.id };
  }

  /**
   * GET /api/v1/auth/me
   * Retorna los datos del usuario autenticado extraídos del JWT.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del usuario autenticado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  getMe(@Req() req: AuthenticatedRequest): { userId: string; email: string; role: string } {
    return req.user;
  }
}
