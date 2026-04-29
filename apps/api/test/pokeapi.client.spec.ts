import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { PokeApiClient } from '../src/pokemon/pokeapi.client';

describe('PokeApiClient', () => {
  const originalFetch = global.fetch;
  let client: PokeApiClient;

  beforeEach(() => {
    client = new PokeApiClient();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('throws a clean error when PokeAPI cannot be reached', async () => {
    jest.mocked(global.fetch).mockRejectedValue(new Error('network failed'));

    await expect(client.getPokemonById(1)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('throws not found for missing Pokemon', async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(client.getPokemonById(999999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws a clean error for failed PokeAPI responses', async () => {
    jest.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(client.getPokemonList(20, 0)).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
