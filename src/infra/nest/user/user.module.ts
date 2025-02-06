import {
  GetMeStory,
  UserLoginStory,
  UserRegisterStory,
} from '@/application/user/stories';
import { Module } from '@nestjs/common';

import { BcryptPasswordHashAdapter } from '@/infra/bcrypt/password_hash.adapter';
import { JwtTokenAdapter } from '@/infra/jsonwebtoken/token.adapter';
import { UserRepository } from '@/application/user/user.repository';
import { TokenPort } from '@/@shared/token';
import { PasswordHashPort } from '@/@shared/password_hash';
import { PrismaUserRepository } from '@/infra/prisma/user/user.repository';
import { UserController } from './user.controller';

@Module({
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'TokenPort',
      useClass: JwtTokenAdapter,
    },
    {
      provide: 'PasswordHashPort',
      useClass: BcryptPasswordHashAdapter,
    },
    {
      provide: GetMeStory.Story,
      useFactory: (user_repository: UserRepository, token_adapter: TokenPort) =>
        new GetMeStory.Story(user_repository, token_adapter),
      inject: ['UserRepository', 'TokenPort'],
    },
    {
      provide: UserLoginStory.Story,
      useFactory: (
        user_repository: UserRepository,
        token_adapter: TokenPort,
        hash_adapter: PasswordHashPort,
      ) =>
        new UserLoginStory.Story(user_repository, token_adapter, hash_adapter),
      inject: ['UserRepository', 'TokenPort', 'PasswordHashPort'],
    },
    {
      provide: UserRegisterStory.Story,
      useFactory: (
        user_repository: UserRepository,
        hash_adapter: PasswordHashPort,
      ) => new UserRegisterStory.Story(user_repository, hash_adapter),
      inject: ['UserRepository', 'PasswordHashPort'],
    },
  ],
  controllers: [UserController],
  exports: [
    'UserRepository',
    'TokenPort',
    'PasswordHashPort',
    GetMeStory.Story,
    UserLoginStory.Story,
    UserRegisterStory.Story,
  ],
})
export class UserModule {}
