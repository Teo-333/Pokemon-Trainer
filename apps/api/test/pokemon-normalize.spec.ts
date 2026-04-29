import { PokeApiPokemonResponse } from '../src/pokemon/types/pokemon.types';
import { normalizePokemon } from '../src/pokemon/utils/normalize-pokemon';

describe('normalizePokemon', () => {
  const bulbasaur: PokeApiPokemonResponse = {
    id: 1,
    name: 'bulbasaur',
    species: {
      name: 'bulbasaur',
    },
    weight: 69,
    sprites: {
      front_default: 'https://img.pokemondb.net/sprites/bulbasaur.png',
    },
    types: [
      {
        slot: 2,
        type: {
          name: 'poison',
        },
      },
      {
        slot: 1,
        type: {
          name: 'grass',
        },
      },
    ],
  };

  it('maps PokeAPI fields into a normalized DTO', () => {
    expect(normalizePokemon(bulbasaur)).toEqual({
      id: 1,
      name: 'bulbasaur',
      speciesName: 'bulbasaur',
      weight: 69,
      spriteUrl: 'https://img.pokemondb.net/sprites/bulbasaur.png',
      types: ['grass', 'poison'],
    });
  });

  it('handles missing sprite', () => {
    expect(
      normalizePokemon({
        ...bulbasaur,
        sprites: {
          front_default: null,
        },
      }).spriteUrl,
    ).toBeNull();
  });

  it('preserves weight in hectograms', () => {
    expect(normalizePokemon({ ...bulbasaur, weight: 130 }).weight).toBe(130);
  });
});
