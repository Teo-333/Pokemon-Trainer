import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './config/database.module';
import { HealthModule } from './health/health.module';
import { ListsModule } from './lists/lists.module';
import { PokemonModule } from './pokemon/pokemon.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, HealthModule, PokemonModule, ListsModule],
})
export class AppModule {}
