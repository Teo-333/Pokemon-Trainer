import {
  MAX_TOTAL_WEIGHT,
  MIN_DISTINCT_SPECIES,
} from '../constants';
import {
  ListRuleErrorCode,
  ListRuleValidationResult,
  PokemonSnapshot,
} from '../types/list.types';

export class ListRuleError extends Error {
  constructor(
    public readonly code: ListRuleErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export class ListRulesService {
  validate(pokemon: PokemonSnapshot[]): ListRuleValidationResult {
    const totalWeight = this.calculateTotalWeight(pokemon);
    const distinctSpeciesCount = this.countDistinctSpecies(pokemon);

    if (distinctSpeciesCount < MIN_DISTINCT_SPECIES) {
      throw new ListRuleError(
        'MIN_DISTINCT_SPECIES',
        'A list must contain at least 3 Pokemon of different species.',
      );
    }

    if (totalWeight > MAX_TOTAL_WEIGHT) {
      throw new ListRuleError(
        'WEIGHT_LIMIT_EXCEEDED',
        `Total weight must not exceed 1300 hectograms. Current total: ${totalWeight}.`,
      );
    }

    return {
      totalWeight,
      distinctSpeciesCount,
    };
  }

  private calculateTotalWeight(pokemon: PokemonSnapshot[]): number {
    return pokemon.reduce((total, currentPokemon) => total + currentPokemon.weight, 0);
  }

  private countDistinctSpecies(pokemon: PokemonSnapshot[]): number {
    return new Set(pokemon.map((currentPokemon) => currentPokemon.speciesName)).size;
  }
}
