import { None, Option, Some } from '@/@shared/option';
import { Paged } from '@/@shared/paged';
import { Ok } from '@/@shared/result';
import { AsyncResult } from '@/@shared/types';
import {
  FindAllTasksFilter,
  TaskRepository,
  TaskRepositoryError,
} from '@/application/task/task.repository';
import { Task } from '@/domain/task';

// Este repositório normalmente seria um Service do NestJS, mas eu prefiro utilizar classes puras sempre que possível
// para que no futuro seja possível migrar para uma nova versão do NestJS ou para outro framework sem muitas dores de cabeça
export class InMemoryTaskRepository implements TaskRepository {
  data = new Map<string, Task>();

  async create(task: Task): AsyncResult<void, TaskRepositoryError> {
    this.data.set(task.id, task);
    return Ok();
  }

  async update(task: Task): AsyncResult<void, TaskRepositoryError> {
    this.data.set(task.id, task);
    return Ok();
  }

  async delete(task: Task): AsyncResult<void, TaskRepositoryError> {
    this.data.delete(task.id);
    return Ok();
  }

  async find_by_id(id: string): AsyncResult<Option<Task>, TaskRepositoryError> {
    if (this.data.has(id)) {
      return Ok(Some(this.data.get(id) as Task));
    }

    return Ok(None);
  }

  async find_all(
    filter?: FindAllTasksFilter,
  ): AsyncResult<Paged<Task>, TaskRepositoryError> {
    const { page = 1, page_size = 20 } = filter || {};

    const result: Task[] = [];

    const title = filter?.title?.toLowerCase();
    const description = filter?.description?.toLowerCase();

    for (const task of this.data.values()) {
      let pass = true;

      // Filtro de título
      pass &&= !title || task.title.toLowerCase().includes(title);

      // Filtro de descrição
      pass &&=
        !description ||
        task.description?.toLowerCase().includes(description) ||
        false;

      // Filtro de status
      pass &&= !filter?.status || task.status === filter.status;

      if (pass) {
        result.push(task);
      }
    }

    const start = (page - 1) * page_size;
    const end = page * page_size;

    return Ok(
      new Paged(result.slice(start, end), result.length, page, page_size),
    );
  }
}
