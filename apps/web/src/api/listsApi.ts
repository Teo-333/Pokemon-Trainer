import { httpDownload, httpGet, httpPost } from './http';
import {
  CreateListPayload,
  PokemonList,
  PokemonListSummary,
} from '../types/list';

export function getLists(): Promise<PokemonListSummary[]> {
  return httpGet<PokemonListSummary[]>('/lists');
}

export function getList(id: string): Promise<PokemonList> {
  return httpGet<PokemonList>(`/lists/${id}`);
}

export function createList(payload: CreateListPayload): Promise<PokemonList> {
  return httpPost<PokemonList>('/lists', payload);
}

export function downloadList(id: string): Promise<Blob> {
  return httpDownload(`/lists/${id}/download`);
}
