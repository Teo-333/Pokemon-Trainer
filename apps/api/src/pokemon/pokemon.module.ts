import { Module } from '@nestjs/common';
import { PokeApiClient } from './pokeapi.client';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';

@Module({
  controllers: [PokemonController],
  providers: [PokeApiClient, PokemonService],
  exports: [PokemonService],
})
export class PokemonModule {}
