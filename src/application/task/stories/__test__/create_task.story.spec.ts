import { InMemoryTaskRepository } from '@/infra/in_memory/task/task.repository';
import { TaskRepository } from '../../task.repository';
import { Task } from '@/domain/task';
import { CreateTaskStory } from '..';
import { TaskError } from '@/domain/task/task.entity';

describe('CreateTaskStory', () => {
  let repository: TaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('should create a task', async () => {
    const result = await new CreateTaskStory.Story(repository).execute({
      title: 'Test',
      description: 'Test description',
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeInstanceOf(Task);
    expect(result.unwrap().title).toBe('Test');
    expect(result.unwrap().description).toBe('Test description');
  });

  it('should return an error when input is missing', async () => {
    const result = await new CreateTaskStory.Story(repository).execute(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      undefined as any,
    );

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingInput');
  });

  it('should return an error when title is missing', async () => {
    const result = await new CreateTaskStory.Story(repository).execute({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      title: undefined as any,
      description: 'Test description',
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('TaskError');
    expect((result.unwrap_err() as TaskError).errors).toEqual([
      { field: 'title', message: `'title' is required` },
    ]);
  });

  it('should return an error when title is empty', async () => {
    const result = await new CreateTaskStory.Story(repository).execute({
      title: '',
      description: 'Test description',
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('TaskError');
    expect((result.unwrap_err() as TaskError).errors).toEqual([
      { field: 'title', message: `'title' is required` },
    ]);
  });
});
