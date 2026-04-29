export type PokemonSnapshot = {
  pokeApiId: number;
  name: string;
  speciesName: string;
  weight: number;
  spriteUrl: string | null;
  types: string[];
};

export type ListRuleValidationResult = {
  totalWeight: number;
  distinctSpeciesCount: number;
};

export type ListRuleErrorCode =
  | 'MIN_DISTINCT_SPECIES'
  | 'WEIGHT_LIMIT_EXCEEDED';
