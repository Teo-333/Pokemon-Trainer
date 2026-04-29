export type Pokemon = {
  id: number;
  name: string;
  speciesName: string;
  weight: number;
  spriteUrl: string | null;
  types: string[];
};

export type PokemonPage = {
  items: Pokemon[];
  total: number;
  limit: number;
  offset: number;
};
