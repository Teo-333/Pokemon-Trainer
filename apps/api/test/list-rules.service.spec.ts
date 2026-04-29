import {
  MAX_TOTAL_WEIGHT,
  MIN_DISTINCT_SPECIES,
} from '../src/lists/constants';
import { PokemonSnapshot } from '../src/lists/types/list.types';
import {
  ListRuleError,
  ListRulesService,
} from '../src/lists/validators/list-rules.service';

describe('ListRulesService', () => {
  let service: ListRulesService;

  const pokemon = (
    pokeApiId: number,
    speciesName: string,
    weight: number,
    name = `pokemon-${pokeApiId}`,
  ): PokemonSnapshot => ({
    pokeApiId,
    name,
    speciesName,
    weight,
    spriteUrl: null,
    types: ['normal'],
  });

  beforeEach(() => {
    service = new ListRulesService();
  });

  it('allows 3 different species under the weight limit', () => {
    expect(
      service.validate([
        pokemon(1, 'bulbasaur', 100),
        pokemon(4, 'charmander', 100),
        pokemon(7, 'squirtle', 100),
      ]),
    ).toEqual({
      totalWeight: 300,
      distinctSpeciesCount: MIN_DISTINCT_SPECIES,
    });
  });

  it('rejects fewer than 3 distinct species', () => {
    expect(() =>
      service.validate([
        pokemon(1, 'bulbasaur', 100),
        pokemon(2, 'ivysaur', 100),
      ]),
    ).toThrowRuleError('MIN_DISTINCT_SPECIES');
  });

  it('rejects total weight above 1300', () => {
    expect(() =>
      service.validate([
        pokemon(1, 'bulbasaur', 500),
        pokemon(4, 'charmander', 500),
        pokemon(7, 'squirtle', 301),
      ]),
    ).toThrowRuleError('WEIGHT_LIMIT_EXCEEDED');
  });

  it('allows total weight exactly 1300', () => {
    expect(
      service.validate([
        pokemon(1, 'bulbasaur', 500),
        pokemon(4, 'charmander', 500),
        pokemon(7, 'squirtle', MAX_TOTAL_WEIGHT - 1000),
      ]),
    ).toEqual({
      totalWeight: MAX_TOTAL_WEIGHT,
      distinctSpeciesCount: MIN_DISTINCT_SPECIES,
    });
  });

  it('counts speciesName, not Pokemon name', () => {
    expect(() =>
      service.validate([
        pokemon(25, 'pikachu', 100, 'pikachu'),
        pokemon(10080, 'pikachu', 100, 'pikachu-rock-star'),
        pokemon(10081, 'pikachu', 100, 'pikachu-belle'),
      ]),
    ).toThrowRuleError('MIN_DISTINCT_SPECIES');
  });

  it('handles duplicate Pokemon predictably', () => {
    expect(() =>
      service.validate([
        pokemon(1, 'bulbasaur', 100),
        pokemon(1, 'bulbasaur', 100),
        pokemon(4, 'charmander', 100),
      ]),
    ).toThrowRuleError('MIN_DISTINCT_SPECIES');
  });
});

expect.extend({
  toThrowRuleError(received: () => unknown, expectedCode: string) {
    try {
      received();
    } catch (error) {
      const pass = error instanceof ListRuleError && error.code === expectedCode;

      return {
        pass,
        message: () =>
          `expected function to throw ListRuleError with code ${expectedCode}`,
      };
    }

    return {
      pass: false,
      message: () => `expected function to throw ListRuleError with code ${expectedCode}`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toThrowRuleError(expectedCode: string): R;
    }
  }
}
