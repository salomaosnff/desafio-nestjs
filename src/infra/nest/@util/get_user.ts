import { User } from '@/domain/user';
import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user: User;
  }
}

/**
 * Retorna o usuário autenticado
 */
export const CurrentUser = createParamDecorator((_, context) => {
  const request: Request = context.switchToHttp().getRequest();
  return request.user;
});
