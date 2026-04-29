export type PokemonDto = {
  id: number;
  name: string;
  speciesName: string;
  weight: number;
  spriteUrl: string | null;
  types: string[];
};

export type PaginatedPokemonDto = {
  items: PokemonDto[];
  total: number;
  limit: number;
  offset: number;
};

export type PokeApiListResponse = {
  count: number;
  results: Array<{
    name: string;
    url: string;
  }>;
};

export type PokeApiPokemonResponse = {
  id: number;
  name: string;
  species: {
    name: string;
  };
  weight: number;
  sprites: {
    front_default: string | null;
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
};
