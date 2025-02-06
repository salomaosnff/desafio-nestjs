import { Task } from '@/domain/task';
import { InMemoryTaskRepository } from '../task.repository';
import { TaskStatus } from '@/domain/task/task.entity';
import { User } from '@/domain/user';

describe('InMemoryTaskRepository', () => {
  const USER = User.create({
    id: 'user-id',
    username: 'user',
    password: 'abcd',
  }).expect('Failed to create user');

  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('should create a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    const result = await repository.create(task);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeUndefined();
  });

  it('should update a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task);

    const updatedTask = task
      .assign({
        title: 'Updated title',
      })
      .expect('Failed to update task');

    const result = await repository.update(updatedTask);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeUndefined();
  });

  it('should find a task by id', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task);

    const result = await repository.find_by_id(task.id);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().is_some()).toBeTruthy();
    expect(result.unwrap().unwrap()).toEqual(task);
  });

  it('should return None when task is not found', async () => {
    const result = await repository.find_by_id('invalid-id');

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().is_none()).toBeTruthy();
  });

  it('should delete a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task);

    const result = await repository.delete(task);

    expect(result.is_ok()).toBeTruthy();

    const foundResult = (await repository.find_by_id(task.id)).map((result) =>
      result.is_some(),
    );

    expect(foundResult.is_ok()).toBeTruthy();
    expect(foundResult.unwrap()).toBeFalsy();
  });

  it('should find all tasks', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.find_all();

    expect(result.is_ok()).toBeTruthy();

    const tasks = result.unwrap();

    expect(tasks.items.length).toBeLessThanOrEqual(20);
    expect(tasks.total_items).toBeGreaterThanOrEqual(2);
  });

  it('should find all tasks with filter', async () => {
    const task1 = Task.create({
      title: 'A test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Another test',
      description: 'Test description 2',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.find_all({
      title: 'Another',
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toBeGreaterThanOrEqual(1);

    const tasks = result.unwrap().items;

    for (const task of tasks) {
      expect(task.title).toContain('Another');
    }
  });

  it('should find all tasks with pagination', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.find_all({
      page: 2,
      page_size: 1,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toBeGreaterThanOrEqual(2);
  });

  it('should find all tasks with status filter', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
      status: TaskStatus.DONE,
      user_id: USER.id,
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.find_all({
      status: TaskStatus.DONE,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toBeGreaterThanOrEqual(1);

    const tasks = result.unwrap().items;

    for (const task of tasks) {
      expect(task.status).toEqual(TaskStatus.DONE);
    }
  });

  it('should find all tasks with title and description filter', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: USER.id,
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
      user_id: USER.id,
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.find_all({
      title: 'Test',
      description: '2',
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toBeGreaterThanOrEqual(1);

    const tasks = result.unwrap().items;

    for (const task of tasks) {
      expect(task.title).toContain('Test');
      expect(task.description).toContain('2');
    }
  });
});
