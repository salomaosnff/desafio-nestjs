import { InMemoryTaskRepository } from '@/infra/in_memory/task/task.repository';
import { TaskRepository } from '../../task.repository';
import { FindAllTasksStory } from '..';
import { Task } from '@/domain/task';
import { Paged } from '@/@shared/paged';

describe('FindAllTasksStory', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('should find all tasks', async () => {
    const tasks = [
      {
        title: 'Test',
        description: 'Test description',
        user_id: 'user-id',
      },
      {
        title: 'Test 2',
        description: 'Test description 2',
        user_id: 'user-id',
      },
    ].map((task) => Task.create(task).expect('Failed to create task'));

    for (const task of tasks) {
      await repository.create(task);
    }

    const result = await new FindAllTasksStory.Story(repository).execute();

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeInstanceOf(Paged);

    const { items } = result.unwrap();

    expect(items).toHaveLength(2);

    for (let i = 0; i < tasks.length; i++) {
      expect(items[i].title).toBe(tasks[i].title);
      expect(items[i].description).toBe(tasks[i].description);
    }
  });

  it('should return an empty list when there are no tasks', async () => {
    const result = await new FindAllTasksStory.Story(repository).execute();

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeInstanceOf(Paged);
    expect(result.unwrap().items).toHaveLength(0);
  });

  it('should find all tasks with pagination', async () => {
    const tasks = [
      {
        title: 'Test',
        description: 'Test description',
        user_id: 'user-id',
      },
      {
        title: 'Test 2',
        description: 'Test description 2',
        user_id: 'user-id',
      },
    ].map((task) => Task.create(task).expect('Failed to create task'));

    for (const task of tasks) {
      await repository.create(task);
    }

    const result = await new FindAllTasksStory.Story(repository).execute({
      filter: {
        page: 2,
        page_size: 1,
      },
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeInstanceOf(Paged);
    expect(result.unwrap().items).toHaveLength(1);
    expect(result.unwrap().total_items).toEqual(2);
  });

  it('should find all tasks with filter', async () => {
    const tasks = [
      {
        title: 'A test',
        description: 'Test description',
        user_id: 'user-id',
      },
      {
        title: 'Another test',
        description: 'Test description 2',
        user_id: 'user-id',
      },
    ].map((task) => Task.create(task).expect('Failed to create task'));

    for (const task of tasks) {
      await repository.create(task);
    }

    const result = await new FindAllTasksStory.Story(repository).execute({
      filter: {
        title: 'Another',
      },
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeInstanceOf(Paged);
    expect(result.unwrap().items).toHaveLength(1);
    expect(result.unwrap().total_items).toEqual(1);
  });
});
