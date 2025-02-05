import { Option } from '@/@shared/option';
import { Paged } from '@/@shared/paged';
import { Err, Ok } from '@/@shared/result';
import { AsyncResult } from '@/@shared/types';
import {
  FindAllTasksFilter,
  TaskRepository,
  TaskRepositoryError,
} from '@/application/task/task.repository';
import { Task } from '@/domain/task';
import { TaskStatus } from '@/domain/task/task.entity';
import { Prisma, PrismaClient } from '@prisma/client';

export class PrimaTaskRepository implements TaskRepository {
  prisma = new PrismaClient();

  async create(task: Task): AsyncResult<void, TaskRepositoryError> {
    try {
      await this.prisma.task.create({
        data: {
          id: task.id,
          title: task.title,
          status: task.status,
          description: task.description,
          created_at: task.created_at,
          updated_at: task.updated_at,
        },
      });

      return Ok();
    } catch (error) {
      return Err({ code: 'TaskRepositoryError', message: String(error) });
    }
  }

  async update(task: Task): AsyncResult<void, TaskRepositoryError> {
    try {
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          title: task.title,
          status: task.status,
          description: task.description,
          updated_at: task.updated_at,
        },
      });

      return Ok();
    } catch (error) {
      return Err({ code: 'TaskRepositoryError', message: String(error) });
    }
  }

  async delete(task: Task): AsyncResult<void, TaskRepositoryError> {
    try {
      await this.prisma.task.delete({ where: { id: task.id } });

      return Ok();
    } catch (error) {
      return Err({ code: 'TaskRepositoryError', message: String(error) });
    }
  }

  async findById(id: string): AsyncResult<Option<Task>, TaskRepositoryError> {
    try {
      const result = await this.prisma.task.findUnique({
        where: { id },
      });

      return Ok(
        Option.from_nullish(result).map((model) =>
          Task.create({
            id: model.id,
            title: model.title,
            status: model.status as TaskStatus,
            description: model.description || undefined,
            created_at: model.created_at,
            updated_at: model.updated_at,
          }).expect('Failed to convert model to Task'),
        ),
      );
    } catch (error) {
      return Err({ code: 'TaskRepositoryError', message: String(error) });
    }
  }

  async findAll(
    filter?: FindAllTasksFilter,
  ): AsyncResult<Paged<Task>, TaskRepositoryError> {
    try {
      const {
        page = 1,
        page_size = 10,
        title,
        description,
        status,
      } = filter || {};

      const where: Prisma.TaskWhereInput = {
        title: { contains: title },
        description: { contains: description },
        status: status ? { equals: status } : undefined,
      };

      const [tasks, total] = await Promise.all([
        this.prisma.task.findMany({
          where,
          take: page_size,
          skip: (page - 1) * page_size,
        }),
        this.prisma.task.count({ where }),
      ]);

      return Ok(
        new Paged(
          tasks.map((model) =>
            Task.create({
              id: model.id,
              title: model.title,
              status: model.status as TaskStatus,
              description: model.description || undefined,
              created_at: model.created_at,
              updated_at: model.updated_at,
            }).expect('Failed to convert model to Task'),
          ),
          total,
          page,
          page_size,
        ),
      );
    } catch (error) {
      return Err({ code: 'TaskRepositoryError', message: String(error) });
    }
  }
}
