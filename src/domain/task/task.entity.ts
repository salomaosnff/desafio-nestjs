/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Err, Ok, Result } from '@/@shared/result';

/**
 * Status de uma tarefa
 */
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

/**
 * Entrada para criar uma tarefa
 */
interface CreateTaskInput {
  id?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Erro de tarefa inválida
 */
export interface TaskError {
  readonly code: 'TaskError';
  readonly errors: { field: string; message: string }[];
}

/**
 * Entidade de tarefa
 */
export class Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  created_at: Date;
  updated_at: Date;

  constructor(task: CreateTaskInput) {
    Object.assign(this, task);
  }

  /**
   * Cria uma nova tarefa e valida
   * @param task
   * @returns
   */
  static create(task: CreateTaskInput): Result<Task, TaskError> {
    task.id ??= crypto.randomUUID();
    task.status ??= TaskStatus.OPEN;
    task.created_at ??= new Date();
    task.updated_at ??= task.created_at;

    return new Task(task).validate();
  }

  /**
   * Atualiza e valida a tarefa
   */
  assign(task: Partial<CreateTaskInput>): Result<Task, TaskError> {
    const keys = ['title', 'description', 'status'] as const;

    for (const key of keys) {
      if (typeof task[key] !== 'undefined') {
        this[key] = task[key] as any;
      }
    }

    this.updated_at = new Date();

    return this.validate();
  }

  /**
   * Valida a tarefa
   * @returns
   */
  validate(): Result<Task, TaskError> {
    if (!this.title?.length) {
      return Err({
        code: 'TaskError',
        errors: [{ field: 'title', message: `'title' is required` }],
      });
    }

    return Ok(this);
  }
}
