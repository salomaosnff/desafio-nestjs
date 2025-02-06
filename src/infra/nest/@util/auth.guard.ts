import { TokenPort } from '@/@shared/token';
import { UserRepository } from '@/application/user/user.repository';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    @Inject('TokenPort') private readonly tokenAdapter: TokenPort,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization ?? '';
    const token = authorization.split('Bearer ')[1]?.trim();

    if (!token) {
      return false;
    }

    const user_id_result = await this.tokenAdapter.get_user_id(token);

    if (user_id_result.is_err()) {
      if (user_id_result.error.code === 'InvalidToken') {
        throw new UnauthorizedException('Invalid token');
      }

      if (user_id_result.error.code === 'TokenExpired') {
        throw new UnauthorizedException('Token expired');
      }
    }

    const user_id = user_id_result.unwrap();
    const user_result = await this.userRepository.find_by_id(user_id);

    if (user_result.is_err()) {
      if (user_result.error.code === 'UserRepositoryError') {
        Logger.error(user_result.error.message, user_result.error.code);
        throw new UnauthorizedException('User not found');
      }
    }

    const user = user_result.unwrap();

    if (user.is_none()) {
      return false;
    }

    request.user = user.unwrap();

    return true;
  }
}
