import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './config/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, HealthModule],
})
export class AppModule {}
