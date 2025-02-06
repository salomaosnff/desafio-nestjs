import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from '../user.repository';
import { User } from '@/domain/user';

describe('PrimsaUserRepository', () => {
  const USER = User.create({
    id: 'user-id',
    username: 'user',
    password: 'abcd',
  }).expect('Failed to create user');

  let repository: PrismaUserRepository;

  beforeAll(async () => {
    const client = new PrismaClient();

    await client.user.create({
      data: {
        id: USER.id,
        username: USER.username,
        password: USER.password,
      },
    });

    await client.$disconnect();
  });

  beforeEach(() => {
    repository = new PrismaUserRepository();
  });

  afterAll(async () => {
    const client = new PrismaClient();

    await client.user.deleteMany({
      where: {
        id: {
          in: [USER.id, 'new-user-id'],
        },
      },
    });

    await client.$disconnect();
    await repository.prisma.$disconnect();
  });

  it('should find a user by id', async () => {
    await repository.create(USER);
    const result = await repository.find_by_id(USER.id);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().is_some()).toEqual(true);
    expect(result.unwrap().unwrap()).toMatchObject(
      expect.objectContaining({
        id: USER.id,
      }),
    );
  });

  it('should find a user by username', async () => {
    const user = User.create(USER).expect('Failed to create user');

    await repository.create(user);

    const result = await repository.find_by_username(USER.username);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap().is_some()).toEqual(true);
    expect(result.unwrap().unwrap()).toMatchObject(
      expect.objectContaining({
        username: USER.username,
      }),
    );
  });

  it('should return None when user is not found', async () => {
    const result = await repository.find_by_id('invalid-id');

    expect(result.is_err()).toBe(false);
    expect(result.unwrap().is_none()).toBeTruthy();
  });

  it('should create a user', async () => {
    const user = User.create({
      id: 'new-user-id',
      username: 'new-user',
      password: 'abcd',
    }).expect('Failed to create user');

    const result = await repository.create(user);

    expect(result.is_ok()).toBeTruthy();
    expect(result.unwrap()).toBeUndefined();
  });
});
