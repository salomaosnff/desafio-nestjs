import { InMemoryTaskRepository } from '@/infra/in_memory/task/task.repository';
import { TaskRepository } from '../../task.repository';
import { Task } from '@/domain/task';
import { FindTaskByIdStory } from '..';

describe('FindTaskByIdStory', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('should find a task by id', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: 'user-id',
    }).expect('Failed to create task');

    await repository.create(task);

    const result = await new FindTaskByIdStory.Story(repository).execute({
      id: task.id,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeInstanceOf(Task);
    expect(result.unwrap()).toEqual(task);
  });

  it('should return an error when task is not found', async () => {
    const result = await new FindTaskByIdStory.Story(repository).execute({
      id: 'invalid-id',
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('TaskNotFound');
  });

  it('should return an error when input is missing', async () => {
    const result = await new FindTaskByIdStory.Story(repository).execute(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      undefined as any,
    );

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when task id is missing', async () => {
    const result = await new FindTaskByIdStory.Story(repository).execute({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: undefined as any,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when task id is empty', async () => {
    const result = await new FindTaskByIdStory.Story(repository).execute({
      id: '',
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });
});
