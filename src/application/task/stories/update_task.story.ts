import { AsyncResult } from '@/@shared/types';
import { TaskRepository, TaskRepositoryError } from '../task.repository';
import { Task } from '@/domain/task';
import { TaskError, TaskStatus } from '@/domain/task/task.entity';
import { Err, Ok } from '@/@shared/result';
import { User } from '@/domain/user';

export interface StoryInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  user: User;
}

export type StoryError =
  | TaskError
  | TaskRepositoryError
  | { code: 'TaskNotFound' }
  | { code: 'MissingTaskId' }
  | { code: 'UserIsNotOwner' }
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
    const { id, user, ...data } = input ?? {};

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
      .and_then((task) => task.assign(data))
      .and_then_async(async (task) => {
        await this.taskRepository.update(task);
        return Ok(task);
      });
  }
}
