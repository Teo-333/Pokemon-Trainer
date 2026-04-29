import { Pokemon } from './pokemon';

export type PokemonSnapshot = {
  pokeApiId: number;
  name: string;
  speciesName: string;
  weight: number;
  spriteUrl: string | null;
  types: string[];
};

export type PokemonListSummary = {
  id: string;
  name: string;
  totalWeight: number;
  distinctSpeciesCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PokemonList = PokemonListSummary & {
  pokemon: PokemonSnapshot[];
};

export type CreateListPayload = {
  name: string;
  pokemonIds: Pokemon['id'][];
};

export type ListFile = {
  version: 1;
  name: string;
  pokemonIds: Pokemon['id'][];
};
