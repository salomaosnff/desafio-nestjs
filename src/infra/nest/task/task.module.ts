import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import {
  CreateTaskStory,
  DeleteTaskStory,
  FindAllTasksStory,
  FindTaskByIdStory,
  UpdateTaskByIdStory,
} from '@/application/task/stories';
import { TaskRepository } from '@/application/task/task.repository';

// import { InMemoryTaskRepository } from '@/infra/in_memory/task/task.repository';
import { PrimaTaskRepository } from '@/infra/prisma/task/task.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    {
      provide: 'TaskRepository',
      useClass: PrimaTaskRepository, // Experimente trocar para `InMemoryTaskRepository`
    },
    // Abaixo optei por utilizar `useFactory` para instanciar as stories
    // pois assim não preciso importar dependencias do NestJS no arquivo da story
    {
      provide: CreateTaskStory.Story,
      useFactory: (repository: TaskRepository) =>
        new CreateTaskStory.Story(repository),
      inject: ['TaskRepository'],
    },
    {
      provide: UpdateTaskByIdStory.Story,
      useFactory: (repository: TaskRepository) =>
        new UpdateTaskByIdStory.Story(repository),
      inject: ['TaskRepository'],
    },
    {
      provide: DeleteTaskStory.Story,
      useFactory: (repository: TaskRepository) =>
        new DeleteTaskStory.Story(repository),
      inject: ['TaskRepository'],
    },
    {
      provide: FindAllTasksStory.Story,
      useFactory: (repository: TaskRepository) =>
        new FindAllTasksStory.Story(repository),
      inject: ['TaskRepository'],
    },
    {
      provide: FindTaskByIdStory.Story,
      useFactory: (repository: TaskRepository) =>
        new FindTaskByIdStory.Story(repository),
      inject: ['TaskRepository'],
    },
  ],
  controllers: [TaskController],
  exports: [
    'TaskRepository',
    CreateTaskStory.Story,
    UpdateTaskByIdStory.Story,
    DeleteTaskStory.Story,
    FindAllTasksStory.Story,
    FindTaskByIdStory.Story,
  ],
})
export class TaskModule {}
