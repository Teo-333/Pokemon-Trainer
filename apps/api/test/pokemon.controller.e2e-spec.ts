import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { setupApp } from '../src/common/bootstrap/setup-app';
import { PokemonController } from '../src/pokemon/pokemon.controller';
import { PokemonService } from '../src/pokemon/pokemon.service';

describe('PokemonController', () => {
  let app: INestApplication;
  const pokemonService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: pokemonService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('passes pagination query values to the service', async () => {
    pokemonService.findAll.mockResolvedValue({
      items: [],
      total: 0,
      limit: 10,
      offset: 20,
    });

    const response = await request(app.getHttpServer())
      .get('/api/pokemon?limit=10&offset=20')
      .expect(200);

    expect(response.body).toEqual({
      items: [],
      total: 0,
      limit: 10,
      offset: 20,
    });
    expect(pokemonService.findAll).toHaveBeenCalledWith(10, 20);
  });

  it('uses default pagination values', async () => {
    pokemonService.findAll.mockResolvedValue({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
    });

    await request(app.getHttpServer()).get('/api/pokemon').expect(200);

    expect(pokemonService.findAll).toHaveBeenCalledWith(20, 0);
  });

  it('returns one Pokemon by ID', async () => {
    pokemonService.findOne.mockResolvedValue({
      id: 1,
      name: 'bulbasaur',
      speciesName: 'bulbasaur',
      weight: 69,
      spriteUrl: null,
      types: ['grass'],
    });

    const response = await request(app.getHttpServer()).get('/api/pokemon/1').expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: 'bulbasaur',
      speciesName: 'bulbasaur',
      weight: 69,
      spriteUrl: null,
      types: ['grass'],
    });
    expect(pokemonService.findOne).toHaveBeenCalledWith(1);
  });

  it('returns a consistent error for unknown Pokemon IDs', async () => {
    pokemonService.findOne.mockRejectedValue(
      new NotFoundException({
        message: 'Pokemon was not found.',
        code: 'POKEMON_NOT_FOUND',
      }),
    );

    await request(app.getHttpServer())
      .get('/api/pokemon/999999')
      .expect(404)
      .expect({
        message: 'Pokemon was not found.',
        code: 'POKEMON_NOT_FOUND',
        statusCode: 404,
        path: '/api/pokemon/999999',
      });
  });
});
