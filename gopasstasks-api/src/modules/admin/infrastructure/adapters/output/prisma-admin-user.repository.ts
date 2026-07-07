import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/database/prisma.service';
import {
  IAdminUserRepository,
  AdminUserListItem,
  AdminUserDetail,
  UserListFilters,
  PaginatedResult,
} from '../../../domain/ports/i-admin-user.repository';

@Injectable()
export class PrismaAdminUserRepository implements IAdminUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: UserListFilters): Promise<PaginatedResult<AdminUserListItem>> {
    const { roleId, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = roleId ? { roleId } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: true,
          _count: {
            select: {
              projects: true,
              tasksAssigned: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        isActive: u.isActive,
        role: { id: u.role.id, name: u.role.name },
        projectCount: u._count.projects,
        taskCount: u._count.tasksAssigned,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<AdminUserDetail | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        projects: {
          include: { project: true },
        },
        _count: {
          select: {
            projects: true,
            tasksAssigned: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: { id: user.role.id, name: user.role.name },
      projectCount: user._count.projects,
      taskCount: user._count.tasksAssigned,
      createdAt: user.createdAt,
      projects: user.projects.map((pm) => ({
        id: pm.project.id,
        name: pm.project.name,
        memberRole: pm.role,
      })),
    };
  }

  async changeRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });
  }

  async deactivate(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async countAdmins(): Promise<number> {
    return this.prisma.user.count({
      where: {
        isActive: true,
        role: { name: 'ADMIN' },
      },
    });
  }

  async findRoles(): Promise<Array<{ id: string; name: string; description: string | null; userCount: number }>> {
    const roles = await this.prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userCount: r._count.users,
    }));
  }

  async findRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      users: role.users,
    };
  }
}
