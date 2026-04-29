import { getApiBaseUrl } from './http';

describe('getApiBaseUrl', () => {
  it('reads the API base URL from Vite environment', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
  });
});
