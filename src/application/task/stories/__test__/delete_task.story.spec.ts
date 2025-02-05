import { InMemoryTaskRepository } from '@/infra/in_memory/task/task.repository';
import { TaskRepository } from '../../task.repository';
import { DeleteTaskStory } from '..';
import { Task } from '@/domain/task';

describe('DeleteTaskStory', () => {
  let taskRepository: TaskRepository;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
  });

  it('should delete a task', async () => {
    const task = Task.create({
      title: 'Test',
      description: 'Test description',
    }).expect('Failed to create task');

    (await taskRepository.create(task)).expect('Failed to create task');

    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      id: task.id,
    });

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeUndefined();
  });

  it('should return an error when task is not found', async () => {
    const task = Task.create({
      title: 'Inexistent task',
      description: 'Test description',
    }).expect('Failed to create task');

    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      id: task.id,
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
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });

  it('should return an error when task id is empty', async () => {
    const result = await new DeleteTaskStory.Story(taskRepository).execute({
      id: '',
    });

    expect(result.is_err()).toBeTruthy();
    expect(result.unwrap_err().code).toBe('MissingTaskId');
  });
});
