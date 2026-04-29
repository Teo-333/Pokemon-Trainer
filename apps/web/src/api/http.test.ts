import { ApiError, getApiBaseUrl, httpGet, httpPost, normalizeApiError } from './http';

describe('getApiBaseUrl', () => {
  it('reads the API base URL from Vite environment', () => {
    expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
  });
});

describe('http helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes backend API errors', async () => {
    const response = new Response(
      JSON.stringify({
        message: 'A list must contain at least 3 Pokemon of different species.',
        code: 'MIN_DISTINCT_SPECIES',
        statusCode: 400,
        path: '/api/lists',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    await expect(normalizeApiError(response)).resolves.toMatchObject({
      message: 'A list must contain at least 3 Pokemon of different species.',
      code: 'MIN_DISTINCT_SPECIES',
      statusCode: 400,
      path: '/api/lists',
    });
  });

  it('normalizes non-JSON API errors', async () => {
    const error = await normalizeApiError(new Response('Bad gateway', { status: 502 }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      message: 'Request failed with status 502',
      code: 'REQUEST_FAILED',
      statusCode: 502,
    });
  });

  it('builds GET requests from the API base URL', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(httpGet<{ status: string }>('/health')).resolves.toEqual({
      status: 'ok',
    });
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/health', {
      body: undefined,
      headers: undefined,
      method: 'GET',
    });
  });

  it('sends JSON POST requests', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await httpPost('/lists', { name: 'Starter Team' });

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/lists', {
      body: JSON.stringify({ name: 'Starter Team' }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });
});
