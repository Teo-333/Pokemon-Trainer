import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { setupApp } from '../src/common/bootstrap/setup-app';
import { ListsController } from '../src/lists/lists.controller';
import { ListsService } from '../src/lists/lists.service';

describe('ListsController', () => {
  let app: INestApplication;
  const listsService = {
    create: jest.fn(),
    createDownloadFile: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        {
          provide: ListsService,
          useValue: listsService,
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

  it('creates a list', async () => {
    listsService.create.mockResolvedValue({
      id: 'list-id',
      name: 'Starter Team',
      pokemon: [],
      totalWeight: 300,
      distinctSpeciesCount: 3,
      createdAt: new Date('2026-04-29T10:00:00.000Z'),
      updatedAt: new Date('2026-04-29T10:00:00.000Z'),
    });

    const response = await request(app.getHttpServer())
      .post('/api/lists')
      .send({
        name: 'Starter Team',
        pokemonIds: [1, 4, 7],
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 'list-id',
      name: 'Starter Team',
      totalWeight: 300,
      distinctSpeciesCount: 3,
    });
    expect(listsService.create).toHaveBeenCalledWith({
      name: 'Starter Team',
      pokemonIds: [1, 4, 7],
    });
  });

  it('rejects invalid create bodies', async () => {
    await request(app.getHttpServer())
      .post('/api/lists')
      .send({
        name: '',
        pokemonIds: ['bad'],
      })
      .expect(400)
      .expect((response) => {
        expect(response.body).toMatchObject({
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          path: '/api/lists',
        });
        expect(response.body.message).toContain(
          'name must be longer than or equal to 1 characters',
        );
      });

    expect(listsService.create).not.toHaveBeenCalled();
  });

  it('returns a clear error for invalid species count', async () => {
    listsService.create.mockRejectedValue(
      new BadRequestException({
        message: 'A list must contain at least 3 Pokemon of different species.',
        code: 'MIN_DISTINCT_SPECIES',
      }),
    );

    await request(app.getHttpServer())
      .post('/api/lists')
      .send({
        name: 'Invalid Team',
        pokemonIds: [1, 2, 3],
      })
      .expect(400)
      .expect({
        message: 'A list must contain at least 3 Pokemon of different species.',
        code: 'MIN_DISTINCT_SPECIES',
        statusCode: 400,
        path: '/api/lists',
      });
  });

  it('returns a clear error for overweight lists', async () => {
    listsService.create.mockRejectedValue(
      new BadRequestException({
        message: 'Total weight must not exceed 1300 hectograms. Current total: 1420.',
        code: 'WEIGHT_LIMIT_EXCEEDED',
      }),
    );

    await request(app.getHttpServer())
      .post('/api/lists')
      .send({
        name: 'Heavy Team',
        pokemonIds: [1, 4, 143],
      })
      .expect(400)
      .expect({
        message: 'Total weight must not exceed 1300 hectograms. Current total: 1420.',
        code: 'WEIGHT_LIMIT_EXCEEDED',
        statusCode: 400,
        path: '/api/lists',
      });
  });

  it('returns list summaries', async () => {
    listsService.findAll.mockResolvedValue([
      {
        id: 'list-id',
        name: 'Starter Team',
        totalWeight: 300,
        distinctSpeciesCount: 3,
        createdAt: new Date('2026-04-29T10:00:00.000Z'),
        updatedAt: new Date('2026-04-29T10:00:00.000Z'),
      },
    ]);

    const response = await request(app.getHttpServer()).get('/api/lists').expect(200);

    expect(response.body).toEqual([
      {
        id: 'list-id',
        name: 'Starter Team',
        totalWeight: 300,
        distinctSpeciesCount: 3,
        createdAt: '2026-04-29T10:00:00.000Z',
        updatedAt: '2026-04-29T10:00:00.000Z',
      },
    ]);
    expect(listsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('returns full list details', async () => {
    listsService.findOne.mockResolvedValue({
      id: 'list-id',
      name: 'Starter Team',
      pokemon: [],
      totalWeight: 300,
      distinctSpeciesCount: 3,
      createdAt: new Date('2026-04-29T10:00:00.000Z'),
      updatedAt: new Date('2026-04-29T10:00:00.000Z'),
    });

    const response = await request(app.getHttpServer())
      .get('/api/lists/list-id')
      .expect(200);

    expect(response.body).toMatchObject({
      id: 'list-id',
      name: 'Starter Team',
      pokemon: [],
      totalWeight: 300,
      distinctSpeciesCount: 3,
    });
    expect(listsService.findOne).toHaveBeenCalledWith('list-id');
  });

  it('downloads a versioned JSON file', async () => {
    listsService.createDownloadFile.mockResolvedValue({
      filename: 'starter-team.json',
      content: {
        version: 1,
        name: 'Starter Team',
        pokemonIds: [1, 4, 7],
      },
    });

    const response = await request(app.getHttpServer())
      .get('/api/lists/list-id/download')
      .expect(200);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.headers['content-disposition']).toContain('attachment');
    expect(response.headers['content-disposition']).toContain('starter-team.json');
    expect(response.body).toEqual({
      version: 1,
      name: 'Starter Team',
      pokemonIds: [1, 4, 7],
    });
    expect(listsService.createDownloadFile).toHaveBeenCalledWith('list-id');
  });

  it('returns 404 for unknown list IDs', async () => {
    listsService.findOne.mockRejectedValue(
      new NotFoundException({
        message: 'Pokemon list was not found.',
        code: 'LIST_NOT_FOUND',
      }),
    );

    await request(app.getHttpServer())
      .get('/api/lists/missing')
      .expect(404)
      .expect({
        message: 'Pokemon list was not found.',
        code: 'LIST_NOT_FOUND',
        statusCode: 404,
        path: '/api/lists/missing',
      });
  });

  it('returns 404 for unknown list download IDs', async () => {
    listsService.createDownloadFile.mockRejectedValue(
      new NotFoundException({
        message: 'Pokemon list was not found.',
        code: 'LIST_NOT_FOUND',
      }),
    );

    await request(app.getHttpServer())
      .get('/api/lists/missing/download')
      .expect(404)
      .expect({
        message: 'Pokemon list was not found.',
        code: 'LIST_NOT_FOUND',
        statusCode: 404,
        path: '/api/lists/missing/download',
      });
  });
});
