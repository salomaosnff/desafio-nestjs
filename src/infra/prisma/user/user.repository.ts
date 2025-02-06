/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Option } from '@/@shared/option';
import { Err, Ok } from '@/@shared/result';
import { AsyncResult } from '@/@shared/types';
import {
  UserRepository,
  UserRepositoryError,
} from '@/application/user/user.repository';
import { User } from '@/domain/user';
import { PrismaClient } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
  prisma = new PrismaClient();

  async find_by_id(id: string): AsyncResult<Option<User>, UserRepositoryError> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      return Ok(
        Option.from_nullish(user).map((model) =>
          User.create({
            id: model.id,
            username: model.username,
            password: model.password,
            created_at: model.created_at,
            updated_at: model.updated_at,
          }).expect('Cannot create user from database'),
        ),
      );
    } catch (error) {
      return Err({ code: 'UserRepositoryError', message: String(error) });
    }
  }

  async find_by_username(
    username: string,
  ): AsyncResult<Option<User>, UserRepositoryError> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      return Ok(
        Option.from_nullish(user).map((model) =>
          User.create({
            id: model.id,
            username: model.username,
            password: model.password,
            created_at: model.created_at,
            updated_at: model.updated_at,
          }).expect('Cannot create user from database'),
        ),
      );
    } catch (error) {
      return Err({ code: 'UserRepositoryError', message: String(error) });
    }
  }

  async create(user: User): AsyncResult<void, UserRepositoryError> {
    try {
      await this.prisma.user.create({
        data: {
          id: user.id,
          username: user.username,
          password: user.password,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });

      return Ok();
    } catch (error) {
      return Err({ code: 'UserRepositoryError', message: String(error) });
    }
  }
}
