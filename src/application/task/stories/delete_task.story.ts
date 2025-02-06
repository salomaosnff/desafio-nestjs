import { AsyncResult } from '@/@shared/types';
import { TaskRepository, TaskRepositoryError } from '../task.repository';
import { TaskError } from '@/domain/task/task.entity';
import { Err, Ok } from '@/@shared/result';
import { User } from '@/domain/user';

export interface Input {
  id: string;
  user: User;
}

export type StoryError =
  | TaskError
  | TaskRepositoryError
  | { code: 'UserIsNotOwner' }
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
    const { id, user } = input ?? {};

    if (!id) {
      return Err({ code: 'MissingTaskId' });
    }

    return (await this.taskRepository.find_by_id(id))
      .map_err<StoryError>()
      .and_then((result) => result.ok_or({ code: 'TaskNotFound' }))
      .and_then((task) => {
        if (task.user_id !== user.id) {
          return Err({ code: 'UserIsNotOwner' });
        }

        return Ok(task);
      })
      .and_then_async((task) => this.taskRepository.delete(task));
  }
}
