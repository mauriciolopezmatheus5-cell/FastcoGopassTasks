import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainException,
  RecursoNoEncontradoException,
  RecursoDuplicadoException,
} from '../../domain/exceptions';

/**
 * Tipo guard para verificar si un error es un PrismaClientKnownRequestError.
 */
function isPrismaClientKnownRequestError(error: unknown): error is { code: string; message: string } {
  if (!(error instanceof Error)) return false;
  const err = error as unknown as { code?: unknown; message?: string };
  return typeof err.code === 'string' && typeof err.message === 'string';
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, mensaje } = this.resolverExcepcion(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${mensaje}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} → ${mensaje}`);
    }

    response.status(statusCode).json({
      statusCode,
      error: this.obtenerNombreError(statusCode),
      mensaje,
      ruta: request.url,
      marca_temporal: new Date().toISOString(),
    });
  }

  private resolverExcepcion(exception: unknown): { statusCode: number; mensaje: string } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const respuesta = exception.getResponse();
      let mensaje: string;
      if (typeof respuesta === 'string') {
        mensaje = respuesta;
      } else if (typeof respuesta === 'object' && respuesta !== null && 'message' in respuesta) {
        const msg = (respuesta as Record<string, unknown>).message;
        mensaje = Array.isArray(msg) ? msg.join('. ') : String(msg);
      } else {
        mensaje = this.mensajePorDefecto(status);
      }
      return { statusCode: status, mensaje };
    }

    if (isPrismaClientKnownRequestError(exception)) {
      return this.resolverErrorPrisma(exception);
    }

    // Excepciones de dominio propias (antes del catch-all 500)
    if (exception instanceof DomainException) {
      if (exception instanceof RecursoNoEncontradoException) {
        return { statusCode: HttpStatus.NOT_FOUND, mensaje: exception.message };
      }
      if (exception instanceof RecursoDuplicadoException) {
        return { statusCode: HttpStatus.CONFLICT, mensaje: exception.message };
      }
      // ReglaNegocioException y cualquier otra DomainException → 400
      return { statusCode: HttpStatus.BAD_REQUEST, mensaje: exception.message };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      mensaje: 'Ocurrió un error interno. Por favor, inténtelo más tarde.',
    };
  }

  private resolverErrorPrisma(
    error: { code: string; message: string },
  ): { statusCode: number; mensaje: string } {
    switch (error.code) {
      case 'P2002':
        return { statusCode: HttpStatus.CONFLICT, mensaje: 'Ya existe un registro con estos datos.' };
      case 'P2025':
        return { statusCode: HttpStatus.NOT_FOUND, mensaje: 'El recurso solicitado no fue encontrado.' };
      case 'P2003':
        return { statusCode: HttpStatus.BAD_REQUEST, mensaje: 'La operación hace referencia a un recurso inexistente.' };
      case 'P2014':
        return { statusCode: HttpStatus.BAD_REQUEST, mensaje: 'No se puede eliminar porque otros registros dependen de él.' };
      default:
        return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, mensaje: 'Error inesperado en la base de datos.' };
    }
  }

  private obtenerNombreError(statusCode: number): string {
    const nombres: Record<number, string> = {
      400: 'Solicitud incorrecta',
      401: 'No autenticado',
      403: 'Acceso denegado',
      404: 'No encontrado',
      409: 'Conflicto',
      422: 'Entidad no procesable',
      500: 'Error interno del servidor',
      503: 'Servicio no disponible',
    };
    return nombres[statusCode] ?? 'Error desconocido';
  }

  private mensajePorDefecto(statusCode: number): string {
    const mensajes: Record<number, string> = {
      400: 'La solicitud contiene datos inválidos.',
      401: 'Debe iniciar sesión para acceder a este recurso.',
      403: 'No tiene permisos para realizar esta acción.',
      404: 'El recurso solicitado no fue encontrado.',
      409: 'Ya existe un recurso con los mismos datos.',
      500: 'Ocurrió un error interno.',
    };
    return mensajes[statusCode] ?? 'Ocurrió un error inesperado.';
  }
}
