import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { PrismaService } from '../../shared/infrastructure/database/prisma.service';
import { PrismaTaskRepository } from './infrastructure/adapters/output/prisma-task.repository';
import { TaskController } from './infrastructure/adapters/input/task.controller';
import { ProjectTasksController } from './infrastructure/adapters/input/project-tasks.controller';
import { ITaskRepository, TASK_REPOSITORY } from './domain/ports/i-task.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { GetTasksByProjectUseCase } from './application/use-cases/get-tasks-by-project.use-case';
import { GetTaskByIdUseCase } from './application/use-cases/get-task-by-id.use-case';
import { UpdateTaskUseCase } from './application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/delete-task.use-case';
import { ChangeTaskStatusUseCase } from './application/use-cases/change-task-status.use-case';
import { AssignTaskMemberUseCase } from './application/use-cases/assign-task-member.use-case';
import { UnassignTaskMemberUseCase } from './application/use-cases/unassign-task-member.use-case';
import { LogWorkUseCase } from './application/use-cases/log-work.use-case';
import { GetWorkLogsUseCase } from './application/use-cases/get-work-logs.use-case';

/**
 * Módulo de tareas.
 * Registra el repositorio Prisma y todos los casos de uso del módulo.
 * Usa el patrón useFactory con tokens de inyección para mantener
 * el desacoplamiento entre dominio e infraestructura.
 */
@Module({
  imports: [PrismaModule],
  controllers: [TaskController, ProjectTasksController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useClass: PrismaTaskRepository,
    },
    {
      provide: CreateTaskUseCase,
      useFactory: (repo: ITaskRepository, prisma: PrismaService) =>
        new CreateTaskUseCase(repo, prisma),
      inject: [TASK_REPOSITORY, PrismaService],
    },
    {
      provide: GetTasksByProjectUseCase,
      useFactory: (repo: ITaskRepository) => new GetTasksByProjectUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: GetTaskByIdUseCase,
      useFactory: (repo: ITaskRepository, prisma: PrismaService) =>
        new GetTaskByIdUseCase(repo, prisma),
      inject: [TASK_REPOSITORY, PrismaService],
    },
    {
      provide: UpdateTaskUseCase,
      useFactory: (repo: ITaskRepository) => new UpdateTaskUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: DeleteTaskUseCase,
      useFactory: (repo: ITaskRepository, prisma: PrismaService) =>
        new DeleteTaskUseCase(repo, prisma),
      inject: [TASK_REPOSITORY, PrismaService],
    },
    {
      provide: ChangeTaskStatusUseCase,
      useFactory: (repo: ITaskRepository) => new ChangeTaskStatusUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: AssignTaskMemberUseCase,
      useFactory: (repo: ITaskRepository, prisma: PrismaService) =>
        new AssignTaskMemberUseCase(repo, prisma),
      inject: [TASK_REPOSITORY, PrismaService],
    },
    {
      provide: UnassignTaskMemberUseCase,
      useFactory: (repo: ITaskRepository) => new UnassignTaskMemberUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: LogWorkUseCase,
      useFactory: (repo: ITaskRepository) => new LogWorkUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: GetWorkLogsUseCase,
      useFactory: (repo: ITaskRepository) => new GetWorkLogsUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
  ],
})
export class TasksModule {}
