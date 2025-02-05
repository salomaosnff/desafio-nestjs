import { AsyncResult } from '@/@shared/types';
import { TaskRepository, TaskRepositoryError } from '../task.repository';
import { Task } from '@/domain/task';
import { TaskError } from '@/domain/task/task.entity';
import { Err } from '@/@shared/result';

export interface StoryInput {
  title: string;
  description?: string;
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
    })
      .map_err<StoryError>()
      .and_then_async((task) => this.taskRepository.create(task));
  }
}
