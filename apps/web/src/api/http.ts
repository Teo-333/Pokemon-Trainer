const DEFAULT_API_URL = 'http://localhost:3000/api';

export type ApiErrorBody = {
  message?: string;
  code?: string;
  statusCode?: number;
  path?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code = 'REQUEST_FAILED',
    public readonly path = '',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type HttpRequestOptions = {
  method?: string;
  body?: unknown;
  responseType?: 'json' | 'blob';
};

export function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

export async function httpGet<TResponse>(path: string): Promise<TResponse> {
  return httpRequest<TResponse>(path);
}

export async function httpPost<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  return httpRequest<TResponse>(path, {
    method: 'POST',
    body,
  });
}

export async function httpDownload(path: string): Promise<Blob> {
  return httpRequest<Blob>(path, {
    responseType: 'blob',
  });
}

export async function httpRequest<TResponse>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers: buildHeaders(options.body),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw await normalizeApiError(response);
  }

  if (options.responseType === 'blob') {
    return response.blob() as Promise<TResponse>;
  }

  return response.json() as Promise<TResponse>;
}

export async function normalizeApiError(response: Response): Promise<ApiError> {
  const body = await readErrorBody(response);

  return new ApiError(
    body.message ?? `Request failed with status ${response.status}`,
    body.statusCode ?? response.status,
    body.code,
    body.path,
  );
}

function buildHeaders(body: unknown): HeadersInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  return {
    'Content-Type': 'application/json',
  };
}

async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return {};
  }

  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}
