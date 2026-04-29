import { LIST_FILE_VERSION } from '../constants';
import { PokemonList } from '../types/list.types';

export type ListFile = {
  version: typeof LIST_FILE_VERSION;
  name: string;
  pokemonIds: number[];
};

export type DownloadableListFile = {
  filename: string;
  content: ListFile;
};

export function createListFile(list: PokemonList): ListFile {
  return {
    version: LIST_FILE_VERSION,
    name: list.name,
    pokemonIds: list.pokemon.map((pokemon) => pokemon.pokeApiId),
  };
}

export function createDownloadFilename(listName: string): string {
  const safeName = listName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${safeName || 'pokemon-list'}.json`;
}
