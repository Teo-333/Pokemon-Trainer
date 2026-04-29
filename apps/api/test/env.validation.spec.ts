import { validateEnv } from '../src/config/env.validation';

describe('validateEnv', () => {
  it('uses defaults when optional values are missing', () => {
    expect(validateEnv({})).toEqual({
      PORT: 3000,
      MONGODB_URI: 'mongodb://localhost:27017/pokemon_collections',
    });
  });

  it('reads MongoDB URI and port from the environment', () => {
    expect(
      validateEnv({
        PORT: '3100',
        MONGODB_URI: 'mongodb://mongo:27017/pokemon_collections',
      }),
    ).toEqual({
      PORT: 3100,
      MONGODB_URI: 'mongodb://mongo:27017/pokemon_collections',
    });
  });

  it('rejects an invalid port', () => {
    expect(() => validateEnv({ PORT: 'abc' })).toThrow(
      'PORT must be an integer between 1 and 65535',
    );
  });

  it('rejects a non-MongoDB URI', () => {
    expect(() => validateEnv({ MONGODB_URI: 'postgres://localhost/db' })).toThrow(
      'MONGODB_URI must be a valid MongoDB connection string',
    );
  });
});
