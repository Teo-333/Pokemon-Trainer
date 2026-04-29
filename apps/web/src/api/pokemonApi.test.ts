import { getPokemonById, getPokemonPage } from './pokemonApi';
import { bulbasaur } from '../test/fixtures';

describe('pokemonApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gets a paginated Pokemon page', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        items: [bulbasaur],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    );

    await expect(getPokemonPage(20, 0)).resolves.toEqual({
      items: [bulbasaur],
      total: 1,
      limit: 20,
      offset: 0,
    });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/pokemon?limit=20&offset=0',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('gets one Pokemon by ID', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(bulbasaur));

    await expect(getPokemonById(1)).resolves.toEqual(bulbasaur);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/pokemon/1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
