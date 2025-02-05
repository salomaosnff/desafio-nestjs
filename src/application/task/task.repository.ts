import { Option } from '@/@shared/option';
import { Paged, PageRequestParams } from '@/@shared/paged';
import { AsyncResult } from '@/@shared/types';
import { Task } from '@/domain/task';
import { TaskStatus } from '@/domain/task/task.entity';

/**
 * Erro relacionado ao repositório de tarefas
 */
export interface TaskRepositoryError {
  readonly code: 'TaskRepositoryError';
  readonly message: string;
}

/**
 * Filtro para busca de tarefas
 */
export interface FindAllTasksFilter extends PageRequestParams {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

/**
 * Representa um repositório de tarefas
 *
 * Este repositório é responsável por realizar todas as operações de banco de dados relacionadas a tarefas
 */
export interface TaskRepository {
  /**
   * Cria uma nova tarefa
   * @param task Tarefa a ser criada
   * @returns Tarefa criada
   */
  create(task: Task): AsyncResult<Task, TaskRepositoryError>;

  /**
   * Atualiza uma tarefa
   * @param task Tarefa a ser atualizada
   * @returns Tarefa atualizada
   */
  update(task: Task): AsyncResult<Task, TaskRepositoryError>;

  /**
   * Remove uma tarefa
   * @param id Identificador da tarefa
   */
  delete(task: Task): AsyncResult<void, TaskRepositoryError>;

  /**
   * Busca uma tarefa
   * @param id Identificador da tarefa
   * @returns Tarefa encontrada
   */
  findById(id: string): AsyncResult<Option<Task>, TaskRepositoryError>;

  /**
   * Busca todas as tarefas
   * @returns Lista de tarefas
   */
  findAll(
    filter?: FindAllTasksFilter,
  ): AsyncResult<Paged<Task>, TaskRepositoryError>;
}
