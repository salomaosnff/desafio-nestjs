import { AsyncResult } from '@/@shared/types';
import { TaskRepository, TaskRepositoryError } from '../task.repository';
import { Task } from '@/domain/task';
import { TaskError } from '@/domain/task/task.entity';
import { Err } from '@/@shared/result';

export interface Input {
  id: string;
}

export type StoryError =
  | TaskError
  | TaskRepositoryError
  | { code: 'TaskNotFound' }
  | { code: 'MissingTaskId' };

/**
 * Busca uma tarefa pelo campo `id`
 */
export class Story {
  constructor(
    /** Repositório de tarefas */
    private taskRepository: TaskRepository,
  ) {}

  async execute(input?: Input): AsyncResult<Task, StoryError> {
    const { id } = input ?? {};

    if (!id) {
      return Err({
        code: 'MissingTaskId',
      });
    }

    return (await this.taskRepository.findById(id))
      .map_err<StoryError>()
      .and_then((result) => result.ok_or({ code: 'TaskNotFound' }));
  }
}
