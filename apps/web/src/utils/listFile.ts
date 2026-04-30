import { ListFile } from '../types/list';

export const LIST_FILE_VERSION = 1;

export type ListFileErrorCode =
  | 'INVALID_JSON'
  | 'MISSING_VERSION'
  | 'UNSUPPORTED_VERSION'
  | 'MISSING_POKEMON_IDS'
  | 'INVALID_POKEMON_IDS';

export class ListFileError extends Error {
  constructor(public readonly code: ListFileErrorCode) {
    super(code);
    this.name = 'ListFileError';
  }
}

export function parseListFileContent(content: string): ListFile {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ListFileError('INVALID_JSON');
  }

  if (!isRecord(parsed)) {
    throw new ListFileError('INVALID_JSON');
  }

  if (!('version' in parsed)) {
    throw new ListFileError('MISSING_VERSION');
  }

  if (parsed.version !== LIST_FILE_VERSION) {
    throw new ListFileError('UNSUPPORTED_VERSION');
  }

  if (!('pokemonIds' in parsed)) {
    throw new ListFileError('MISSING_POKEMON_IDS');
  }

  if (!isValidPokemonIds(parsed.pokemonIds)) {
    throw new ListFileError('INVALID_POKEMON_IDS');
  }

  return {
    version: LIST_FILE_VERSION,
    name: typeof parsed.name === 'string' ? parsed.name : '',
    pokemonIds: parsed.pokemonIds,
  };
}

export async function parseListFile(file: File): Promise<ListFile> {
  return parseListFileContent(await readFileAsText(file));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidPokemonIds(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((id) => Number.isSafeInteger(id) && id > 0)
  );
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
