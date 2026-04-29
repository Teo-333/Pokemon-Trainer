import { Pokemon } from '../types/pokemon';
import { PokemonList, PokemonListSummary } from '../types/list';

export const bulbasaur: Pokemon = {
  id: 1,
  name: 'bulbasaur',
  speciesName: 'bulbasaur',
  weight: 69,
  spriteUrl: null,
  types: ['grass', 'poison'],
};

export const starterListSummary: PokemonListSummary = {
  id: '507f1f77bcf86cd799439011',
  name: 'Starter Team',
  totalWeight: 244,
  distinctSpeciesCount: 3,
  createdAt: '2026-04-29T10:00:00.000Z',
  updatedAt: '2026-04-29T10:00:00.000Z',
};

export const starterList: PokemonList = {
  ...starterListSummary,
  pokemon: [
    {
      pokeApiId: 1,
      name: 'bulbasaur',
      speciesName: 'bulbasaur',
      weight: 69,
      spriteUrl: null,
      types: ['grass', 'poison'],
    },
    {
      pokeApiId: 4,
      name: 'charmander',
      speciesName: 'charmander',
      weight: 85,
      spriteUrl: null,
      types: ['fire'],
    },
    {
      pokeApiId: 7,
      name: 'squirtle',
      speciesName: 'squirtle',
      weight: 90,
      spriteUrl: null,
      types: ['water'],
    },
  ],
};
