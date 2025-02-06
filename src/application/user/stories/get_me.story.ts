import { AsyncResult } from '@/@shared/types';
import { UserRepository, UserRepositoryError } from '../user.repository';
import { User } from '@/domain/user';
import { Err } from '@/@shared/result';
import { TokenPort } from '@/@shared/token';

export type StoryError = UserRepositoryError | { code: 'UserUnauthenticated' };

export class Story {
  constructor(
    /** Repositório de usuários */
    private user_repository: UserRepository,
    /** Adaptador de token */
    private token_adapter: TokenPort,
  ) {}

  async execute(token: string): AsyncResult<User, StoryError> {
    if (!token) {
      return Err({ code: 'UserUnauthenticated' });
    }

    const user_id_result = (
      await this.token_adapter.get_user_id(token)
    ).map_err<StoryError>();

    if (user_id_result.is_err()) {
      return Err(user_id_result.error);
    }

    const user_result = await this.user_repository.find_by_id(
      user_id_result.unwrap(),
    );

    if (user_result.is_err()) {
      return Err(user_result.error);
    }

    return user_result.unwrap().ok_or({ code: 'UserUnauthenticated' });
  }
}
