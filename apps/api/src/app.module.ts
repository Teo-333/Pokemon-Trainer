import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './config/database.module';
import { HealthModule } from './health/health.module';
import { PokemonModule } from './pokemon/pokemon.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, HealthModule, PokemonModule],
})
export class AppModule {}
