import { Injectable } from '@nestjs/common';
import { PokeApiClient } from './pokeapi.client';
import { PaginatedPokemonDto, PokemonDto } from './types/pokemon.types';
import { normalizePokemon } from './utils/normalize-pokemon';

@Injectable()
export class PokemonService {
  private readonly pokemonById = new Map<number, PokemonDto>();

  constructor(private readonly pokeApiClient: PokeApiClient) {}

  async findAll(limit: number, offset: number): Promise<PaginatedPokemonDto> {
    const list = await this.pokeApiClient.getPokemonList(limit, offset);
    const items = await Promise.all(
      list.results.map((pokemon) => this.findOne(this.extractPokemonId(pokemon.url))),
    );

    return {
      items,
      total: list.count,
      limit,
      offset,
    };
  }

  async findOne(id: number): Promise<PokemonDto> {
    const cachedPokemon = this.pokemonById.get(id);

    if (cachedPokemon) {
      return cachedPokemon;
    }

    const pokemon = normalizePokemon(await this.pokeApiClient.getPokemonById(id));
    this.pokemonById.set(id, pokemon);

    return pokemon;
  }

  private extractPokemonId(url: string): number {
    const match = url.match(/\/pokemon\/(\d+)\/?$/);

    if (!match) {
      throw new Error(`Cannot extract Pokemon ID from URL: ${url}`);
    }

    return Number(match[1]);
  }
}
