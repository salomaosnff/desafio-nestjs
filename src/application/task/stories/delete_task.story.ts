import { AsyncResult } from '@/@shared/types';
import { TaskRepository, TaskRepositoryError } from '../task.repository';
import { TaskError } from '@/domain/task/task.entity';
import { Err } from '@/@shared/result';

export interface Input {
  id: string;
}

export type StoryError =
  | TaskError
  | TaskRepositoryError
  | { code: 'MissingTaskId' }
  | { code: 'TaskNotFound' };

/**
 * Deleta uma tarefa do repositório
 */
export class Story {
  constructor(
    /** Repositório de tarefas */
    private taskRepository: TaskRepository,
  ) {}

  async execute(input: Input): AsyncResult<void, StoryError> {
    const { id } = input ?? {};

    if (!id) {
      return Err({ code: 'MissingTaskId' });
    }

    return (await this.taskRepository.findById(id))
      .map_err<StoryError>()
      .and_then((result) => result.ok_or({ code: 'TaskNotFound' }))
      .and_then_async((task) => this.taskRepository.delete(task));
  }
}
