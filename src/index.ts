import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from '~configs/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(env.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();