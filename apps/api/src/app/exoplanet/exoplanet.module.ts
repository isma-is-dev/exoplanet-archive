import { Module } from '@nestjs/common';
import { ExoplanetController } from './exoplanet.controller';
import { ExoplanetService } from './exoplanet.service';

@Module({
  controllers: [ExoplanetController],
  providers: [ExoplanetService],
  exports: [ExoplanetService],
})
export class ExoplanetModule {}
