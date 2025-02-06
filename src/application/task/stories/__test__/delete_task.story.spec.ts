import { InMemoryTaskRepository } from '@/infra/in_memory/task/task.repository';
import { TaskRepository } from '../../task.repository';
import { DeleteTaskStory } from '..';
import { Task } from '@/domain/task';
import { User } from '@/domain/user';

describe('DeleteTaskStory', () => {
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

  let taskRepository: TaskRepository;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
  });

  it('should delete a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
      user_id: 'user-id',
    }).expect('Failed to create task');

    (await taskRepository.create(task)).expect('Failed to create task');

    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      id: task.id,
      user: USER,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeUndefined();
  });

  it('should return an error when task is not found', async () => {
    const task = Task.create({
      title: 'Inexistent task',
      description: 'Test description',
      user_id: 'user-id',
    }).expect('Failed to create task');

    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      id: task.id,
      user: USER,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('TaskNotFound');
  });

  it('should return an error when input is missing', async () => {
    const result = await new DeleteTaskStory.Story(taskRepository).execute(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      undefined as any,
    );

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when task id is missing', async () => {
    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: undefined as any,
      user: USER,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when task id is empty', async () => {
    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      id: '',
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

    (await taskRepository.create(task)).expect('Failed to create task');

    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      id: task.id,
      user: USER_2,
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('UserIsNotOwner');
  });
});
