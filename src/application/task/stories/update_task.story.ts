import { AsyncResult } from '@/@shared/types';
import { TaskRepository, TaskRepositoryError } from '../task.repository';
import { Task } from '@/domain/task';
import { TaskError, TaskStatus } from '@/domain/task/task.entity';
import { Err } from '@/@shared/result';

export interface StoryInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export type StoryError =
  | TaskError
  | TaskRepositoryError
  | { code: 'TaskNotFound' }
  | { code: 'MissingTaskId' }
  | { code: 'MissingInput'; error: TypeError };

/**
 * Atualiza uma tarefa e a armazena no repositório
 */
export class Story {
  constructor(
    /** Repositório de tarefas */
    private taskRepository: TaskRepository,
  ) {}

  async execute(input: StoryInput): AsyncResult<Task, StoryError> {
    const { id, ...data } = input ?? {};

    if (!id) {
      return Err({ code: 'MissingTaskId' });
    }

    return (await this.taskRepository.findById(id))
      .map_err<StoryError>()
      .and_then((result) => result.ok_or({ code: 'TaskNotFound' }))
      .and_then((task) => task.assign(data))
      .and_then_async((task) => this.taskRepository.update(task));
  }
}
