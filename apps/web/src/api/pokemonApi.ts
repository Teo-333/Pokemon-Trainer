import { httpGet } from './http';
import { Pokemon, PokemonPage } from '../types/pokemon';

export function getPokemonPage(limit: number, offset: number): Promise<PokemonPage> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  return httpGet<PokemonPage>(`/pokemon?${query.toString()}`);
}

export function getPokemonById(id: number): Promise<Pokemon> {
  return httpGet<Pokemon>(`/pokemon/${id}`);
}
