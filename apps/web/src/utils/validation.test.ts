import {
  MAX_TOTAL_WEIGHT,
  MIN_DISTINCT_SPECIES,
  validateSelectedPokemon,
} from './validation';
import { bulbasaur, charmander, squirtle } from '../test/fixtures';
import { Pokemon } from '../types/pokemon';

describe('validateSelectedPokemon', () => {
  it('accepts a valid selection', () => {
    expect(validateSelectedPokemon([bulbasaur, charmander, squirtle])).toEqual({
      isValid: true,
      totalWeight: 244,
      distinctSpeciesCount: MIN_DISTINCT_SPECIES,
      issues: [],
    });
  });

  it('detects fewer than 3 distinct species', () => {
    const result = validateSelectedPokemon([bulbasaur, charmander]);

    expect(result).toMatchObject({
      isValid: false,
      totalWeight: 154,
      distinctSpeciesCount: 2,
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'MIN_DISTINCT_SPECIES',
      }),
    );
  });

  it('detects total weight above 1300', () => {
    const result = validateSelectedPokemon([
      pokemon(1, 'bulbasaur', 500),
      pokemon(4, 'charmander', 500),
      pokemon(7, 'squirtle', 301),
    ]);

    expect(result).toMatchObject({
      isValid: false,
      totalWeight: 1301,
      distinctSpeciesCount: 3,
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'WEIGHT_LIMIT_EXCEEDED',
      }),
    );
  });

  it('allows total weight exactly 1300', () => {
    expect(
      validateSelectedPokemon([
        pokemon(1, 'bulbasaur', 500),
        pokemon(4, 'charmander', 500),
        pokemon(7, 'squirtle', MAX_TOTAL_WEIGHT - 1000),
      ]),
    ).toEqual({
      isValid: true,
      totalWeight: MAX_TOTAL_WEIGHT,
      distinctSpeciesCount: 3,
      issues: [],
    });
  });

  it('counts the same species once', () => {
    const result = validateSelectedPokemon([
      pokemon(25, 'pikachu', 100, 'pikachu'),
      pokemon(10080, 'pikachu', 100, 'pikachu-rock-star'),
      pokemon(10081, 'pikachu', 100, 'pikachu-belle'),
    ]);

    expect(result).toMatchObject({
      isValid: false,
      totalWeight: 300,
      distinctSpeciesCount: 1,
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: 'MIN_DISTINCT_SPECIES',
      }),
    );
  });
});

function pokemon(
  id: number,
  speciesName: string,
  weight: number,
  name = `pokemon-${id}`,
): Pokemon {
  return {
    id,
    name,
    speciesName,
    weight,
    spriteUrl: null,
    types: ['normal'],
  };
}
