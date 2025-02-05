import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

export async function bootstrap() {
  const { PORT = 3000 } = process.env;

  const app = await NestFactory.create(AppModule);

  await app.listen(PORT);
}
