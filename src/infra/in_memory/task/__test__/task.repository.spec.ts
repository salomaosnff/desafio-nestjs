import { Task } from '@/domain/task';
import { InMemoryTaskRepository } from '../task.repository';
import { TaskStatus } from '@/domain/task/task.entity';

describe('InMemoryTaskRepository', () => {
  let repository: InMemoryTaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('should create a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    const result = await repository.create(task);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toEqual(task);
  });

  it('should update a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    await repository.create(task);

    const updatedTask = task
      .assign({
        title: 'Updated title',
      })
      .expect('Failed to update task');

    const result = await repository.update(updatedTask);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toEqual(updatedTask);
  });

  it('should find a task by id', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    await repository.create(task);

    const result = await repository.findById(task.id);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().is_some()).toBeTruthy();
    expect(result.unwrap().unwrap()).toEqual(task);
  });

  it('should return None when task is not found', async () => {
    const result = await repository.findById('invalid-id');

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().is_none()).toBeTruthy();
  });

  it('should delete a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    await repository.create(task);

    const result = await repository.delete(task);

    expect(result.is_ok()).toBeTruthy();

    const foundResult = (await repository.findById(task.id)).map((result) =>
      result.is_some(),
    );

    expect(foundResult.is_ok()).toBeTruthy();
    expect(foundResult.unwrap()).toBeFalsy();
  });

  it('should find all tasks', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.findAll();

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toEqual(2);
    expect(result.unwrap().items).toEqual([task1, task2]);
  });

  it('should find all tasks with filter', async () => {
    const task1 = Task.create({
      title: 'A test',
      description: 'Test description',
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Another test',
      description: 'Test description 2',
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.findAll({
      title: 'Another',
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toEqual(1);
    expect(result.unwrap().items).toEqual([task2]);
  });

  it('should find all tasks with pagination', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.findAll({
      page: 2,
      page_size: 1,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toEqual(2);
    expect(result.unwrap().items).toEqual([task2]);
  });

  it('should find all tasks with status filter', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
      status: TaskStatus.DONE,
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.findAll({
      status: TaskStatus.DONE,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toEqual(1);
    expect(result.unwrap().items).toEqual([task1]);
  });

  it('should find all tasks with title and description filter', async () => {
    const task1 = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    const task2 = Task.create({
      title: 'Test 2',
      description: 'Test description 2',
    }).expect('Failed to create task');

    await repository.create(task1);
    await repository.create(task2);

    const result = await repository.findAll({
      title: 'Test',
      description: '2',
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().total_items).toEqual(1);
    expect(result.unwrap().items).toEqual([task2]);
  });
});
