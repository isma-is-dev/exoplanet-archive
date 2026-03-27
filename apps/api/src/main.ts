/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Compresión gzip
  app.use(compression());

  // CORS para el frontend Angular
  app.enableCors({
    origin: 'http://localhost:4200',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
