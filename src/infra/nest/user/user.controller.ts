import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/LoginDto';
import {
  GetMeStory,
  UserLoginStory,
  UserRegisterStory,
} from '@/application/user/stories';
import { RegisterDto } from './dto/RegisterDto';

@Controller()
export class UserController {
  constructor(
    private readonly userRegisterStory: UserRegisterStory.Story,
    private readonly userLoginStory: UserLoginStory.Story,
    private readonly getMeStory: GetMeStory.Story,
  ) {}

  @Post('/login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    const result = await this.userLoginStory.execute({
      username: body.username,
      password: body.password,
    });

    if (result.is_ok()) {
      return {
        token: result.value.token,
        user: {
          id: result.value.user.id,
          username: result.value.user.username,
        },
      };
    }

    const error = result.unwrap_err();

    if (error.code === 'InvalidCredentials') {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('/register')
  async register(@Body() body: RegisterDto) {
    const result = await this.userRegisterStory.execute({
      username: body.username,
      password: body.password,
    });

    if (result.is_ok()) {
      return {
        id: result.value.id,
        username: result.value.username,
      };
    }

    const error = result.unwrap_err();

    if (error.code === 'MissingCredentials') {
      throw new BadRequestException('Missing credentials');
    }

    if (error.code === 'UsernameAlreadyExists') {
      throw new ConflictException('Username already exists');
    }

    Logger.error(error.message, error.code);

    throw new InternalServerErrorException();
  }

  @Post('/me')
  async getMe(@Body() token: string) {
    const result = await this.getMeStory.execute(token);

    if (result.is_ok()) {
      return {
        id: result.value.id,
        username: result.value.username,
      };
    }

    const error = result.unwrap_err();

    if (error.code === 'UserUnauthenticated') {
      throw new UnauthorizedException('User unauthenticated');
    }

    Logger.error(error.message, error.code);

    throw new InternalServerErrorException();
  }
}
