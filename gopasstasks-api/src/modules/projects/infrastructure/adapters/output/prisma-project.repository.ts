import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma.service';
import {
  IProjectRepository,
  ProjectMemberInfo,
} from '../../../domain/ports/i-project.repository';
import { Project } from '../../../domain/entities/project.entity';
import {
  RecursoNoEncontradoException,
  RecursoDuplicadoException,
} from '../../../../../shared/domain/exceptions';

/**
 * Tipo guard para verificar si un error es un PrismaClientKnownRequestError.
 */
function isPrismaClientKnownRequestError(error: unknown): error is { code: string; message: string } {
  if (!(error instanceof Error)) return false;
  const err = error as unknown as { code?: unknown; message?: string };
  return typeof err.code === 'string' && typeof err.message === 'string';
}

/**
 * Adaptador de salida (Output Adapter): implementa IProjectRepository con Prisma ORM.
 * Es la única clase del módulo de proyectos que conoce Prisma.
 */
@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** {@inheritdoc IProjectRepository.findAll} */
  async findAll(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => this.mapToDomain(p));
  }

  /** {@inheritdoc IProjectRepository.findById} */
  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    return project ? this.mapToDomain(project) : null;
  }

  /** {@inheritdoc IProjectRepository.save} */
  async save(project: Project): Promise<Project> {
    const created = await this.prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });

    return this.mapToDomain(created);
  }

  /** {@inheritdoc IProjectRepository.update} */
  async update(project: Project): Promise<Project> {
    const updated = await this.prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        description: project.description,
        updatedAt: project.updatedAt,
      },
    });

    return this.mapToDomain(updated);
  }

  /** {@inheritdoc IProjectRepository.delete} */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error) && error.code === 'P2025') {
        throw new RecursoNoEncontradoException('proyecto', id);
      }
      throw error;
    }
  }

  /** {@inheritdoc IProjectRepository.isUserMember} */
  async isUserMember(projectId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    return member !== null;
  }

  /** {@inheritdoc IProjectRepository.getUserRole} */
  async getUserRole(projectId: string, userId: string): Promise<string | null> {
    const member = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    return member?.role ?? null;
  }

  /** {@inheritdoc IProjectRepository.addMember} */
  async addMember(projectId: string, userId: string, role: string): Promise<void> {
    try {
      await this.prisma.projectMember.create({
        data: { projectId, userId, role },
      });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error) && error.code === 'P2002') {
        throw new RecursoDuplicadoException('miembro', 'proyecto');
      }
      throw error;
    }
  }

  /** {@inheritdoc IProjectRepository.removeMember} */
  async removeMember(projectId: string, userId: string): Promise<void> {
    await this.prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });
  }

  /** {@inheritdoc IProjectRepository.getMembers} */
  async getMembers(projectId: string): Promise<ProjectMemberInfo[]> {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
    });

    return members.map((m) => ({
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      // ProjectMember no tiene campo joinedAt; usamos createdAt del proyecto como fallback.
      // En el schema actual no hay timestamp en ProjectMember, usamos fecha actual.
      joinedAt: m.user.createdAt,
    }));
  }

  /** {@inheritdoc IProjectRepository.getMemberCount} */
  async getMemberCount(projectId: string): Promise<number> {
    return this.prisma.projectMember.count({ where: { projectId } });
  }

  /** {@inheritdoc IProjectRepository.getTaskCount} */
  async getTaskCount(projectId: string): Promise<number> {
    return this.prisma.task.count({ where: { projectId } });
  }

  /** {@inheritdoc IProjectRepository.getAdminCount} */
  async getAdminCount(projectId: string): Promise<number> {
    return this.prisma.projectMember.count({ where: { projectId, role: 'ADMIN' } });
  }

  /**
   * Mapea un modelo de Prisma a la entidad de dominio Project.
   * Mantiene el dominio libre de tipos generados por el ORM.
   *
   * @param prismaProject - Modelo de Prisma con los datos del proyecto
   * @returns Entidad de dominio Project
   */
  private mapToDomain(prismaProject: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Project {
    return new Project(
      prismaProject.id,
      prismaProject.createdAt,
      prismaProject.name,
      prismaProject.description,
      prismaProject.updatedAt,
    );
  }
}
