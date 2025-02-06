import { AsyncResult } from '@/@shared/types';
import {
  FindAllTasksFilter,
  TaskRepository,
  TaskRepositoryError,
} from '../task.repository';
import { Task } from '@/domain/task';
import { TaskError } from '@/domain/task/task.entity';
import { Paged } from '@/@shared/paged';

export interface Input {
  filter: FindAllTasksFilter;
}

export type StoryError = TaskError | TaskRepositoryError;

/**
 * Retorna todas as tarefas armazenadas no repositório
 */
export class Story {
  constructor(
    /** Repositório de tarefas */
    private taskRepository: TaskRepository,
  ) {}

  async execute(input?: Input): AsyncResult<Paged<Task>, StoryError> {
    const { filter = {} } = input ?? {};

    filter.page ??= 1;
    filter.page_size ??= 20;

    return this.taskRepository.find_all(filter);
  }
}
