const DEFAULT_API_URL = 'http://localhost:3000/api';

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;
}

export async function httpGet<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
