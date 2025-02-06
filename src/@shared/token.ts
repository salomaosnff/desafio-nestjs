import { User } from '@/domain/user';
import { AsyncResult } from './types';

export type TokenError = { code: 'InvalidToken' } | { code: 'TokenExpired' };

/**
 * Representa um serviço de token
 */
export interface TokenPort {
  /**
   * Gera um token para o usuário
   * @param user
   */
  generate(user: User): Promise<string>;

  /**
   * Retorna o id do usuário a partir do token
   * @param token
   */
  get_user_id(token: string): AsyncResult<string, TokenError>;
}
