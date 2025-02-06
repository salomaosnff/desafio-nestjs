/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Err, Ok } from '@/@shared/result';
import { TokenError, TokenPort } from '@/@shared/token';
import { AsyncResult } from '@/@shared/types';
import { User } from '@/domain/user';
import * as jwt from 'jsonwebtoken';

/**
 * Implementação do serviço de token com JSON Web Token
 */
export class JwtTokenAdapter implements TokenPort {
  async generate(user: User): Promise<string> {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: Number(process.env.JWT_LIFETIME ?? 3600),
    });
  }

  async get_user_id(token: string): AsyncResult<string, TokenError> {
    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      return Ok(id);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return Err({ code: 'TokenExpired' });
      }

      return Err({ code: 'InvalidToken' });
    }
  }
}
