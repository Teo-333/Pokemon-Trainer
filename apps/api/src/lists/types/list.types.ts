export type PokemonSnapshot = {
  pokeApiId: number;
  name: string;
  speciesName: string;
  weight: number;
  spriteUrl: string | null;
  types: string[];
};

export type PokemonList = {
  id: string;
  name: string;
  pokemon: PokemonSnapshot[];
  totalWeight: number;
  distinctSpeciesCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PokemonListSummary = Omit<PokemonList, 'pokemon'>;

export type ListRuleValidationResult = {
  totalWeight: number;
  distinctSpeciesCount: number;
};

export type ListRuleErrorCode =
  | 'MIN_DISTINCT_SPECIES'
  | 'WEIGHT_LIMIT_EXCEEDED';
