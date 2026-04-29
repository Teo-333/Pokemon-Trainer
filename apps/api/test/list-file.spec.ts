import {
  createDownloadFilename,
  createListFile,
} from '../src/lists/utils/list-file';
import { PokemonList } from '../src/lists/types/list.types';

describe('list file utilities', () => {
  const list: PokemonList = {
    id: '507f1f77bcf86cd799439011',
    name: 'Starter Team',
    pokemon: [
      {
        pokeApiId: 1,
        name: 'bulbasaur',
        speciesName: 'bulbasaur',
        weight: 69,
        spriteUrl: null,
        types: ['grass'],
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
    totalWeight: 244,
    distinctSpeciesCount: 3,
    createdAt: new Date('2026-04-29T10:00:00.000Z'),
    updatedAt: new Date('2026-04-29T10:00:00.000Z'),
  };

  it('creates the versioned download format', () => {
    expect(createListFile(list)).toEqual({
      version: 1,
      name: 'Starter Team',
      pokemonIds: [1, 4, 7],
    });
  });

  it('excludes internal MongoDB and snapshot fields', () => {
    const file = createListFile(list);

    expect(file).not.toHaveProperty('id');
    expect(file).not.toHaveProperty('pokemon');
    expect(file).not.toHaveProperty('createdAt');
    expect(file).not.toHaveProperty('updatedAt');
    expect(JSON.stringify(file)).not.toContain('speciesName');
  });

  it('creates a safe filename', () => {
    expect(createDownloadFilename('Starter Team!')).toBe('starter-team.json');
  });

  it('falls back when a name has no safe filename characters', () => {
    expect(createDownloadFilename('!!!')).toBe('pokemon-list.json');
  });
});
