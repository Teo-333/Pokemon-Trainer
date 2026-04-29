import { PokeApiClient } from '../src/pokemon/pokeapi.client';
import { PokemonService } from '../src/pokemon/pokemon.service';
import { PokeApiPokemonResponse } from '../src/pokemon/types/pokemon.types';

describe('PokemonService', () => {
  let client: jest.Mocked<Pick<PokeApiClient, 'getPokemonById' | 'getPokemonList'>>;
  let service: PokemonService;

  const makePokemon = (
    id: number,
    overrides: Partial<PokeApiPokemonResponse> = {},
  ): PokeApiPokemonResponse => ({
    id,
    name: `pokemon-${id}`,
    species: {
      name: `species-${id}`,
    },
    weight: id * 10,
    sprites: {
      front_default: `https://example.com/${id}.png`,
    },
    types: [
      {
        slot: 1,
        type: {
          name: 'normal',
        },
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    client = {
      getPokemonById: jest.fn(),
      getPokemonList: jest.fn(),
    };
    service = new PokemonService(client as unknown as PokeApiClient);
  });

  it('returns a normalized Pokemon by ID', async () => {
    client.getPokemonById.mockResolvedValue(makePokemon(25));

    await expect(service.findOne(25)).resolves.toEqual({
      id: 25,
      name: 'pokemon-25',
      speciesName: 'species-25',
      weight: 250,
      spriteUrl: 'https://example.com/25.png',
      types: ['normal'],
    });
  });

  it('returns paginated normalized Pokemon', async () => {
    client.getPokemonList.mockResolvedValue({
      count: 1302,
      results: [
        {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon/1/',
        },
        {
          name: 'ivysaur',
          url: 'https://pokeapi.co/api/v2/pokemon/2/',
        },
      ],
    });
    client.getPokemonById
      .mockResolvedValueOnce(makePokemon(1))
      .mockResolvedValueOnce(makePokemon(2));

    await expect(service.findAll(2, 0)).resolves.toMatchObject({
      total: 1302,
      limit: 2,
      offset: 0,
      items: [
        {
          id: 1,
          speciesName: 'species-1',
        },
        {
          id: 2,
          speciesName: 'species-2',
        },
      ],
    });
  });

  it('caches Pokemon by ID', async () => {
    client.getPokemonById.mockResolvedValue(makePokemon(4));

    await service.findOne(4);
    await service.findOne(4);

    expect(client.getPokemonById).toHaveBeenCalledTimes(1);
  });

  it('reuses cached Pokemon while resolving paginated results', async () => {
    client.getPokemonById.mockResolvedValue(makePokemon(7));
    await service.findOne(7);

    client.getPokemonList.mockResolvedValue({
      count: 1,
      results: [
        {
          name: 'squirtle',
          url: 'https://pokeapi.co/api/v2/pokemon/7/',
        },
      ],
    });

    await service.findAll(1, 0);

    expect(client.getPokemonById).toHaveBeenCalledTimes(1);
  });
});
