import {
  CreateTaskStory,
  DeleteTaskStory,
  FindAllTasksStory,
  FindTaskByIdStory,
  UpdateTaskByIdStory,
} from '@/application/task/stories';
import { TaskStatus } from '@/domain/task/task.entity';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create_task.dto';
import { UpdateTaskDto } from './dto/update_task.dto';
import { PagedTaskDto } from './dto/paged_task.dto';
import { AuthGuard } from '../@util/auth.guard';
import { PageParams } from '../@util/page_params';
import { PageRequestParams } from '@/@shared/paged';
import { CurrentUser } from '../@util/get_user';
import { User } from '@/domain/user';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(
    private readonly findAllTasksStory: FindAllTasksStory.Story,
    private readonly findTaskByIdStory: FindTaskByIdStory.Story,
    private readonly createTaskStory: CreateTaskStory.Story,
    private readonly updateTaskStory: UpdateTaskByIdStory.Story,
    private readonly deleteTaskStory: DeleteTaskStory.Story,
  ) {}

  @Get()
  async findAll(
    @PageParams() { page, page_size }: PageRequestParams,
    @Query('title') title?: string,
    @Query('description') description?: string,
    @Query('status') status?: TaskStatus,
  ): Promise<PagedTaskDto> {
    const result = await this.findAllTasksStory.execute({
      filter: {
        page,
        page_size,
        title,
        description,
        status,
      },
    });

    return result.match({
      Ok: (paged) => paged,
      Err(error) {
        if (error.code === 'TaskError') {
          throw new BadRequestException(error.errors);
        }

        Logger.error(error.message, error.code);

        throw new InternalServerErrorException();
      },
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.findTaskByIdStory.execute({ id });

    return result.match({
      Ok: (task) => task,
      Err(error) {
        if (error.code === 'TaskNotFound') {
          throw new NotFoundException('Task not found');
        }

        if (error.code === 'MissingTaskId') {
          throw new BadRequestException('Missing task id');
        }

        if (error.code === 'TaskError') {
          throw new BadRequestException(error.errors);
        }

        Logger.error(error.message, error.code);
        throw new InternalServerErrorException();
      },
    });
  }

  @Post()
  async create(@Body() body: CreateTaskDto, @CurrentUser() user: User) {
    const result = await this.createTaskStory.execute({
      title: body.title,
      description: body.description,
      user: user,
    });

    return result.match({
      Ok: (task) => task,
      Err(error) {
        if (error.code === 'TaskError') {
          throw new BadRequestException(error.errors);
        }

        if (error.code === 'MissingInput') {
          throw new BadRequestException(error.error.message);
        }

        Logger.error(error.message, error.code);
        throw new InternalServerErrorException();
      },
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.updateTaskStory.execute({
      id,
      title: body.title,
      description: body.description,
      status: body.status,
      user: user,
    });

    return result.match({
      Ok: (task) => task,
      Err(error) {
        if (error.code === 'TaskNotFound') {
          throw new NotFoundException('Task not found');
        }

        if (error.code === 'MissingTaskId') {
          throw new BadRequestException('Missing task id');
        }

        if (error.code === 'TaskError') {
          throw new BadRequestException(error.errors);
        }

        if (error.code === 'MissingInput') {
          throw new BadRequestException(error.error.message);
        }

        if (error.code === 'UserIsNotOwner') {
          throw new ForbiddenException(
            'Cannot update a task that is not yours',
          );
        }

        Logger.error(error.message, error.code);

        throw new InternalServerErrorException();
      },
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.deleteTaskStory.execute({ id, user });

    if (result.is_ok()) {
      return;
    }

    const error = result.unwrap_err();

    if (error.code === 'TaskNotFound') {
      throw new NotFoundException('Task not found');
    }

    if (error.code === 'MissingTaskId') {
      throw new BadRequestException('Missing task id');
    }

    if (error.code === 'TaskError') {
      throw new BadRequestException(error.errors);
    }

    if (error.code === 'UserIsNotOwner') {
      throw new ForbiddenException('Cannot delete a task that is not yours');
    }

    Logger.error(error.message, error.code);

    throw new InternalServerErrorException();
  }
}
