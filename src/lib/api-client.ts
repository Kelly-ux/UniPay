import { API_BASE_URL } from './env';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  token?: string | null;
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.');
  }

  const { method = 'GET', body, headers = {}, token } = options;

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `HTTP ${resp.status}`);
  }

  if (resp.status === 204) {
    return undefined as unknown as TResponse;
  }

  return (await resp.json()) as TResponse;
}

export const apiClient = {
  get: <TResponse>(path: string, token?: string | null) => request<TResponse>(path, { method: 'GET', token }),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, token?: string | null) =>
    request<TResponse, TBody>(path, { method: 'POST', body, token }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, token?: string | null) =>
    request<TResponse, TBody>(path, { method: 'PUT', body, token }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, token?: string | null) =>
    request<TResponse, TBody>(path, { method: 'PATCH', body, token }),
  delete: <TResponse>(path: string, token?: string | null) => request<TResponse>(path, { method: 'DELETE', token }),
};

