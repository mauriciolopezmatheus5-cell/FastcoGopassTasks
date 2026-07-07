import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/database/prisma.module';
import { ProjectController } from './infrastructure/adapters/input/project.controller';
import { PrismaProjectRepository } from './infrastructure/adapters/output/prisma-project.repository';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { GetProjectsUseCase } from './application/use-cases/get-projects.use-case';
import { GetProjectByIdUseCase } from './application/use-cases/get-project-by-id.use-case';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case';
import { AddProjectMemberUseCase } from './application/use-cases/add-project-member.use-case';
import { RemoveProjectMemberUseCase } from './application/use-cases/remove-project-member.use-case';
import { GetProjectMembersUseCase } from './application/use-cases/get-project-members.use-case';
import { IProjectRepository } from './domain/ports/i-project.repository';

export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';

/**
 * Módulo de proyectos.
 * Registra el repositorio Prisma y todos los casos de uso de la feature.
 */
@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
    {
      provide: CreateProjectUseCase,
      useFactory: (repo: IProjectRepository) => new CreateProjectUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: GetProjectsUseCase,
      useFactory: (repo: IProjectRepository) => new GetProjectsUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: GetProjectByIdUseCase,
      useFactory: (repo: IProjectRepository) => new GetProjectByIdUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: UpdateProjectUseCase,
      useFactory: (repo: IProjectRepository) => new UpdateProjectUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: DeleteProjectUseCase,
      useFactory: (repo: IProjectRepository) => new DeleteProjectUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: AddProjectMemberUseCase,
      useFactory: (repo: IProjectRepository) => new AddProjectMemberUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: RemoveProjectMemberUseCase,
      useFactory: (repo: IProjectRepository) => new RemoveProjectMemberUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
    {
      provide: GetProjectMembersUseCase,
      useFactory: (repo: IProjectRepository) => new GetProjectMembersUseCase(repo),
      inject: [PROJECT_REPOSITORY],
    },
  ],
})
export class ProjectsModule {}
