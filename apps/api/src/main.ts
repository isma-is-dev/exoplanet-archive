/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Cabeceras de seguridad (CSP, HSTS, nosniff, frameguard…).
  // The API only serves JSON, so the policy can stay strict.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    })
  );

  // Compresión gzip
  app.use(compression());

  // Límite de peticiones: la API es pública y de solo lectura, así que se
  // protege contra abuso sin necesidad de autenticación.
  const windowMs = Number(configService.get<string>('RATE_LIMIT_WINDOW_MS') ?? 60_000);
  const max = Number(configService.get<string>('RATE_LIMIT_MAX') ?? 120);
  app.use(
    rateLimit({
      windowMs,
      limit: max,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Exodex is a free public read-only API; please slow down.',
      },
    })
  );

  // CORS para el frontend Angular
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'https://exodex.zemios.dev',
  });

  const port = configService.get<string>('PORT') || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
