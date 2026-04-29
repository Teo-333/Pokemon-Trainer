import { Pokemon } from '../types/pokemon';

export const MIN_DISTINCT_SPECIES = 3;
export const MAX_TOTAL_WEIGHT = 1300;

export type ValidationIssueCode =
  | 'MIN_DISTINCT_SPECIES'
  | 'WEIGHT_LIMIT_EXCEEDED';

export type ValidationIssue = {
  code: ValidationIssueCode;
  message: string;
};

export type SelectionValidationSummary = {
  isValid: boolean;
  totalWeight: number;
  distinctSpeciesCount: number;
  issues: ValidationIssue[];
};

export function validateSelectedPokemon(
  pokemon: Pokemon[],
): SelectionValidationSummary {
  const totalWeight = pokemon.reduce(
    (total, currentPokemon) => total + currentPokemon.weight,
    0,
  );
  const distinctSpeciesCount = new Set(
    pokemon.map((currentPokemon) => currentPokemon.speciesName),
  ).size;
  const issues: ValidationIssue[] = [];

  if (distinctSpeciesCount < MIN_DISTINCT_SPECIES) {
    issues.push({
      code: 'MIN_DISTINCT_SPECIES',
      message: 'Select at least 3 Pokemon of different species.',
    });
  }

  if (totalWeight > MAX_TOTAL_WEIGHT) {
    issues.push({
      code: 'WEIGHT_LIMIT_EXCEEDED',
      message: `Total weight must not exceed 1300 hectograms. Current total: ${totalWeight}.`,
    });
  }

  return {
    isValid: issues.length === 0,
    totalWeight,
    distinctSpeciesCount,
    issues,
  };
}
