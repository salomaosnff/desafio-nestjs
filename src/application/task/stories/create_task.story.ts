import { AsyncResult } from '@/@shared/types';
import { TaskRepository, TaskRepositoryError } from '../task.repository';
import { Task } from '@/domain/task';
import { TaskError } from '@/domain/task/task.entity';
import { Err, Ok } from '@/@shared/result';
import { User } from '@/domain/user';

export interface StoryInput {
  title: string;
  description?: string;
  user: User;
}

export type StoryError =
  | TaskError
  | TaskRepositoryError
  | {
      code: 'MissingInput';
      error: TypeError;
    };

/**
 * Cria uma nova tarefa e a armazena no repositório
 */
export class Story {
  constructor(
    /** Repositório de tarefas */
    private taskRepository: TaskRepository,
  ) {}

  async execute(input: StoryInput): AsyncResult<Task, StoryError> {
    if (!input) {
      return Err({
        code: 'MissingInput',
        error: new TypeError('Missing input'),
      });
    }

    return Task.create({
      title: input.title,
      description: input.description,
      user_id: input.user.id,
    })
      .map_err<StoryError>()
      .and_then_async(async (task) => {
        await this.taskRepository.create(task);
        return Ok(task);
      });
  }
}
