import { InMemoryTaskRepository } from '@/infra/in_memory/task/task.repository';
import { TaskRepository } from '../../task.repository';
import { Task } from '@/domain/task';
import { UpdateTaskByIdStory } from '..';
import { User } from '@/domain/user';

describe('UpdateTaskStory', () => {
  const USER = User.create({
    id: 'user-id',
    username: 'user',
    password: 'abcd',
  }).expect('Failed to create user');
  const USER_2 = User.create({
    id: 'user-id-2',
    username: 'user-2',
    password: 'abcd',
  }).expect('Failed to create user');

  let repository: TaskRepository;

  beforeEach(() => {
    repository = new InMemoryTaskRepository();
  });

  it('should update a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: 'user-id',
    }).expect('Failed to create task');

    await repository.create(task);

    const updatedTask = task
      .assign({
        title: 'Updated title',
      })
      .expect('Failed to update task');

    const result = await new UpdateTaskByIdStory.Story(repository).execute({
      id: task.id,
      title: updatedTask.title,
      description: updatedTask.description,
      user: USER,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toEqual(updatedTask);
  });

  it('should return an error when task is not found', async () => {
    const result = await new UpdateTaskByIdStory.Story(repository).execute({
      id: 'invalid-id',
      title: 'Test',
      description: 'Test description',
      user: USER,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('TaskNotFound');
  });

  it('should return an error when input is missing', async () => {
    const result = await new UpdateTaskByIdStory.Story(repository).execute(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      undefined as any,
    );

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when task id is missing', async () => {
    const result = await new UpdateTaskByIdStory.Story(repository).execute({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: undefined as any,
      title: 'Test',
      description: 'Test description',
      user: USER,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when task id is empty', async () => {
    const result = await new UpdateTaskByIdStory.Story(repository).execute({
      id: '',
      title: 'Test',
      description: 'Test description',
      user: USER,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when user is not the owner of the task', async () => {
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

    const result = await new UpdateTaskByIdStory.Story(repository).execute({
      id: task.id,
      title: updatedTask.title,
      description: updatedTask.description,
      user: USER_2,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('UserIsNotOwner');
  });
});
