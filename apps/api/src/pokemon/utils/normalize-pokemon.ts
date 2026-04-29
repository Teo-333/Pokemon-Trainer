import { PokemonDto, PokeApiPokemonResponse } from '../types/pokemon.types';

export function normalizePokemon(pokemon: PokeApiPokemonResponse): PokemonDto {
  return {
    id: pokemon.id,
    name: pokemon.name,
    speciesName: pokemon.species.name,
    weight: pokemon.weight,
    spriteUrl: pokemon.sprites.front_default,
    types: pokemon.types
      .slice()
      .sort((firstType, secondType) => firstType.slot - secondType.slot)
      .map((pokemonType) => pokemonType.type.name),
  };
}
