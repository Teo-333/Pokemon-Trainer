import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PokeApiListResponse,
  PokeApiPokemonResponse,
} from './types/pokemon.types';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

@Injectable()
export class PokeApiClient {
  async getPokemonList(limit: number, offset: number): Promise<PokeApiListResponse> {
    return this.getJson<PokeApiListResponse>(
      `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    );
  }

  async getPokemonById(id: number): Promise<PokeApiPokemonResponse> {
    return this.getJson<PokeApiPokemonResponse>(`${POKEAPI_BASE_URL}/pokemon/${id}`);
  }

  private async getJson<TResponse>(url: string): Promise<TResponse> {
    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      throw new BadGatewayException({
        message: 'Pokemon data service is unavailable.',
        code: 'POKEAPI_REQUEST_FAILED',
      });
    }

    if (response.status === 404) {
      throw new NotFoundException({
        message: 'Pokemon was not found.',
        code: 'POKEMON_NOT_FOUND',
      });
    }

    if (!response.ok) {
      throw new BadGatewayException({
        message: 'Pokemon data service returned an error.',
        code: 'POKEAPI_REQUEST_FAILED',
      });
    }

    return response.json() as Promise<TResponse>;
  }
}
