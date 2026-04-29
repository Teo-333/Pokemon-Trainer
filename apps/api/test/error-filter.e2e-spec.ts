import { Controller, Get, NotFoundException } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { setupApp } from '../src/common/bootstrap/setup-app';

@Controller('errors')
class ErrorController {
  @Get('not-found')
  getNotFound(): never {
    throw new NotFoundException('Resource was not found');
  }
}

describe('HttpExceptionFilter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ErrorController],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a consistent error response shape', async () => {
    await request(app.getHttpServer()).get('/api/errors/not-found').expect(404).expect({
      message: 'Resource was not found',
      code: 'NOT_FOUND',
      statusCode: 404,
      path: '/api/errors/not-found',
    });
  });
});
