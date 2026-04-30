import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { PokemonService } from '../src/pokemon/pokemon.service';
import { PokemonDto } from '../src/pokemon/types/pokemon.types';
import { PokemonListSchemaClass } from '../src/lists/lists.schema';
import { ListsService } from '../src/lists/lists.service';
import { ListRulesService } from '../src/lists/validators/list-rules.service';

type SavedDocument = PokemonListSchemaClass & {
  id: string;
  save: jest.Mock<Promise<SavedDocument>>;
};

class MockListModel {
  static documents: SavedDocument[] = [];
  static saveCalls = 0;
  static ids = [
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439012',
    '507f1f77bcf86cd799439013',
  ];

  id: string;
  name: string;
  pokemon: SavedDocument['pokemon'];
  totalWeight: number;
  distinctSpeciesCount: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Omit<PokemonListSchemaClass, 'createdAt' | 'updatedAt'>) {
    this.id = MockListModel.ids[MockListModel.documents.length];
    this.name = data.name;
    this.pokemon = data.pokemon;
    this.totalWeight = data.totalWeight;
    this.distinctSpeciesCount = data.distinctSpeciesCount;
    this.createdAt = new Date('2026-04-29T10:00:00.000Z');
    this.updatedAt = new Date('2026-04-29T10:00:00.000Z');
  }

  save = jest.fn(async () => {
    MockListModel.saveCalls += 1;
    const document = this as unknown as SavedDocument;
    MockListModel.documents.push(document);
    return document;
  });

  static find = jest.fn(() => ({
    sort: jest.fn(() => ({
      exec: jest.fn(async () => MockListModel.documents),
    })),
  }));

  static findById = jest.fn((id: string) => ({
    exec: jest.fn(async () =>
      MockListModel.documents.find((document) => document.id === id) ?? null,
    ),
  }));
}

describe('ListsService', () => {
  let service: ListsService;
  let pokemonService: jest.Mocked<Pick<PokemonService, 'findOne'>>;

  const pokemon = (
    id: number,
    speciesName: string,
    weight: number,
  ): PokemonDto => ({
    id,
    name: `pokemon-${id}`,
    speciesName,
    weight,
    spriteUrl: `https://example.com/${id}.png`,
    types: ['normal'],
  });

  beforeEach(() => {
    MockListModel.documents = [];
    MockListModel.saveCalls = 0;
    jest.clearAllMocks();

    pokemonService = {
      findOne: jest.fn(),
    };

    service = new ListsService(
      MockListModel as unknown as Model<PokemonListSchemaClass>,
      pokemonService as unknown as PokemonService,
      new ListRulesService(),
    );
  });

  it('saves a valid list with Pokemon snapshots', async () => {
    pokemonService.findOne
      .mockResolvedValueOnce(pokemon(1, 'bulbasaur', 100))
      .mockResolvedValueOnce(pokemon(4, 'charmander', 200))
      .mockResolvedValueOnce(pokemon(7, 'squirtle', 300));

    const result = await service.create({
      name: 'Starter Team',
      pokemonIds: [1, 4, 7],
    });

    expect(result).toMatchObject({
      id: '507f1f77bcf86cd799439011',
      name: 'Starter Team',
      totalWeight: 600,
      distinctSpeciesCount: 3,
    });
    expect(result.pokemon[0]).toMatchObject({
      pokeApiId: 1,
      name: 'pokemon-1',
      speciesName: 'bulbasaur',
      weight: 100,
    });
    expect(MockListModel.saveCalls).toBe(1);
  });

  it('rejects fewer than 3 species before saving', async () => {
    pokemonService.findOne
      .mockResolvedValueOnce(pokemon(1, 'bulbasaur', 100))
      .mockResolvedValueOnce(pokemon(2, 'bulbasaur', 100))
      .mockResolvedValueOnce(pokemon(4, 'charmander', 100));

    await expect(
      service.create({
        name: 'Invalid Team',
        pokemonIds: [1, 2, 4],
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'MIN_DISTINCT_SPECIES',
      },
    });
    expect(MockListModel.saveCalls).toBe(0);
  });

  it('rejects overweight lists before saving', async () => {
    pokemonService.findOne
      .mockResolvedValueOnce(pokemon(1, 'bulbasaur', 500))
      .mockResolvedValueOnce(pokemon(4, 'charmander', 500))
      .mockResolvedValueOnce(pokemon(7, 'squirtle', 301));

    await expect(
      service.create({
        name: 'Heavy Team',
        pokemonIds: [1, 4, 7],
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'WEIGHT_LIMIT_EXCEEDED',
      },
    });
    expect(MockListModel.saveCalls).toBe(0);
  });

  it('does not trust client-provided Pokemon details', async () => {
    pokemonService.findOne
      .mockResolvedValueOnce(pokemon(1, 'bulbasaur', 100))
      .mockResolvedValueOnce(pokemon(4, 'charmander', 100))
      .mockResolvedValueOnce(pokemon(7, 'squirtle', 100));

    const result = await service.create({
      name: 'Resolved Team',
      pokemonIds: [1, 4, 7],
    });

    expect(result.pokemon.map((snapshot) => snapshot.speciesName)).toEqual([
      'bulbasaur',
      'charmander',
      'squirtle',
    ]);
    expect(pokemonService.findOne).toHaveBeenCalledTimes(3);
  });

  it('returns list summaries without Pokemon snapshots', async () => {
    MockListModel.documents = [
      new MockListModel({
        name: 'Saved Team',
        pokemon: [snapshot(1)],
        totalWeight: 100,
        distinctSpeciesCount: 3,
      }) as unknown as SavedDocument,
    ];

    await expect(service.findAll()).resolves.toEqual([
      {
        id: '507f1f77bcf86cd799439011',
        name: 'Saved Team',
        totalWeight: 100,
        distinctSpeciesCount: 3,
        createdAt: new Date('2026-04-29T10:00:00.000Z'),
        updatedAt: new Date('2026-04-29T10:00:00.000Z'),
      },
    ]);
  });

  it('returns full list details', async () => {
    MockListModel.documents = [
      new MockListModel({
        name: 'Saved Team',
        pokemon: [snapshot(1)],
        totalWeight: 100,
        distinctSpeciesCount: 3,
      }) as unknown as SavedDocument,
    ];

    await expect(service.findOne('507f1f77bcf86cd799439011')).resolves.toMatchObject({
      id: '507f1f77bcf86cd799439011',
      name: 'Saved Team',
      pokemon: [
        {
          pokeApiId: 1,
          speciesName: 'species-1',
        },
      ],
    });
  });

  it('creates a download file for a saved list', async () => {
    MockListModel.documents = [
      new MockListModel({
        name: 'Saved Team',
        pokemon: [snapshot(1), snapshot(4), snapshot(7)],
        totalWeight: 300,
        distinctSpeciesCount: 3,
      }) as unknown as SavedDocument,
    ];

    await expect(
      service.createDownloadFile('507f1f77bcf86cd799439011'),
    ).resolves.toEqual({
      filename: 'saved-team.json',
      content: {
        version: 1,
        name: 'Saved Team',
        pokemonIds: [1, 4, 7],
      },
    });
  });

  it('handles unknown IDs', async () => {
    await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('handles malformed IDs as not found', async () => {
    await expect(service.findOne('not-an-object-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

function snapshot(pokeApiId: number) {
  return {
    pokeApiId,
    name: `pokemon-${pokeApiId}`,
    speciesName: `species-${pokeApiId}`,
    weight: 100,
    spriteUrl: null,
    types: ['normal'],
  };
}
