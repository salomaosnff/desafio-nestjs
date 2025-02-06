import { TokenPort } from '@/@shared/token';
import { UserRepository } from '../user.repository';
import { User } from '@/domain/user';
import { Err, Ok } from '@/@shared/result';
import { AsyncResult } from '@/@shared/types';
import { PasswordHashPort } from '@/@shared/password_hash';

export type StoryError = { code: 'InvalidCredentials' };

export interface StoryInput {
  username: string;
  password: string;
}

/**
 * Autentica um usuário
 */
export class Story {
  constructor(
    /** Repositório de usuários */
    private user_repository: UserRepository,
    /** Adaptador de token */
    private token_adapter: TokenPort,
    /** Adaptador de hash de senha */
    private hash_adapter: PasswordHashPort,
  ) {}

  async execute(
    input: StoryInput,
  ): AsyncResult<{ user: User; token: string }, StoryError> {
    const { username, password } = input;

    if (!username || !password) {
      return Err({ code: 'InvalidCredentials' });
    }

    const find_user_result = (
      await this.user_repository.find_by_username(username)
    ).map_err<StoryError>();

    if (find_user_result.is_err()) {
      return Err(find_user_result.error);
    }

    const user_result = find_user_result.unwrap();

    if (user_result.is_none()) {
      return Err({ code: 'InvalidCredentials' });
    }

    const user = user_result.unwrap();

    if (!(await this.hash_adapter.compare(user.password, password))) {
      return Err({ code: 'InvalidCredentials' });
    }

    const token = await this.token_adapter.generate(user);

    return Ok({
      user,
      token,
    });
  }
}
