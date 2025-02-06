import { UserRepository, UserRepositoryError } from '../user.repository';
import { AsyncResult } from '@/@shared/types';
import { PasswordHashPort } from '@/@shared/password_hash';
import { Err, Ok } from '@/@shared/result';
import { User } from '@/domain/user';

export type StoryError =
  | UserRepositoryError
  | { code: 'MissingCredentials' }
  | { code: 'UsernameAlreadyExists' };

export interface StoryInput {
  username: string;
  password: string;
}

/**
 * Registra um novo usuário
 */
export class Story {
  constructor(
    /** Repositório de usuários */
    private user_repository: UserRepository,
    /** Adaptador de hash de senha */
    private hash_adapter: PasswordHashPort,
  ) {}

  async execute(input: StoryInput): AsyncResult<User, StoryError> {
    const { username, password } = input;

    if (!username || !password) {
      return Err({ code: 'MissingCredentials' });
    }

    const user_exists_result = (
      await this.user_repository.find_by_username(username)
    )
      .map_err<StoryError>()
      .map((user) => user.is_some());

    if (user_exists_result.is_err()) {
      return Err(user_exists_result.error);
    }

    if (user_exists_result.unwrap()) {
      return Err({ code: 'UsernameAlreadyExists' });
    }

    const user_result = User.create({
      username,
      password: await this.hash_adapter.hash(password),
    }).map_err<StoryError>();

    if (user_result.is_err()) {
      return Err(user_result.error);
    }

    const user = user_result.unwrap();

    const user_create_result = await this.user_repository.create(user);

    if (user_create_result.is_err()) {
      return Err(user_create_result.error);
    }

    return Ok(user);
  }
}
