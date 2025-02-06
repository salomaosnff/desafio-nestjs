import { Option } from '@/@shared/option';
import { AsyncResult } from '@/@shared/types';
import { User } from '@/domain/user';

export type UserRepositoryError = {
  code: 'UserRepositoryError';
  message: string;
};

/**
 * Representa um repositório de usuários
 *
 * Este repositório é responsável por realizar todas as operações de banco de dados relacionadas a usuários
 */
export interface UserRepository {
  /**
   * Busca um usuário pelo id
   * @param id Identificador do usuário a ser buscado
   */
  find_by_id(id: string): AsyncResult<Option<User>, UserRepositoryError>;

  /**
   * Busca um usuário pelo username
   * @param username Nome de usuário a ser buscado
   */
  find_by_username(
    username: string,
  ): AsyncResult<Option<User>, UserRepositoryError>;

  /**
   * Cria um novo usuário
   * @param user Usuário a ser criado
   */
  create(user: User): AsyncResult<void, UserRepositoryError>;
}
