import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExoplanetModule } from './exoplanet/exoplanet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ExoplanetModule,
  ],
})
export class AppModule {}
