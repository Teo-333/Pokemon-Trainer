import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { setupApp } from '../src/common/bootstrap/setup-app';
import { HealthModule } from '../src/health/health.module';

describe('Health endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns ok', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200).expect({
      status: 'ok',
    });
  });
});
