/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Err, Ok, Result } from '@/@shared/result';

/**
 * Entrada para criar um usuário
 */
interface CreateUserInput {
  id?: string;
  username: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Erro de usuário inválido
 */
export interface UserError {
  readonly code: 'UserError';
  readonly errors: { field: string; message: string }[];
}

/**
 * Entidade de Usuário
 */
export class User {
  id: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;

  constructor(user: CreateUserInput) {
    Object.assign(this, user);
  }

  /**
   * Cria um novo usuário e valida
   * @param user
   */
  static create(user: CreateUserInput): Result<User, UserError> {
    user.id ??= crypto.randomUUID();
    user.created_at ??= new Date();
    user.updated_at ??= user.created_at;

    return new User(user).validate();
  }

  /**
   * Atualiza e valida a tarefa
   */
  assign(task: Partial<CreateUserInput>): Result<User, UserError> {
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
  validate(): Result<User, UserError> {
    if (!this.username?.length) {
      return Err({
        code: 'UserError',
        errors: [{ field: 'username', message: `'username' is required` }],
      });
    }

    if (!this.password?.length) {
      return Err({
        code: 'UserError',
        errors: [{ field: 'password', message: `'password' is required` }],
      });
    }

    return Ok(this);
  }
}
