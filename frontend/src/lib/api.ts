const rawApiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL?.trim() || '/api';

export const API_BASE_URL = rawApiBaseUrl.endsWith('/api')
  ? rawApiBaseUrl
  : `${rawApiBaseUrl.replace(/\/$/, '')}/api`;

const getAuthToken = () => localStorage.getItem('token') ?? '';

const LOCAL_USER_KEY = 'event-sphere-local-users';

const getLocalUserForToken = (token: string) => {
  try {
    const users = JSON.parse(localStorage.getItem(LOCAL_USER_KEY) ?? '{}');
    return Object.values(users).find((u: any) => u.token === token) as any | undefined;
  } catch {
    return undefined;
  }
};

const buildHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      // If this is a local fallback token, include the local user payload so the backend
      // can accept and persist the offline user for protected routes.
      if (token.startsWith('local-')) {
        const localUser = getLocalUserForToken(token);
        if (localUser) {
          try {
            const json = JSON.stringify(localUser);
            const encoded = typeof window !== 'undefined' ? window.btoa(json) : '';
            headers['X-Local-User'] = encoded;
          } catch {
            // ignore encoding errors
          }
        }
      }
    }
  }

  return headers;
};

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  const data = text && contentType?.includes('application/json') ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data?.message ?? response.statusText ?? 'Request failed');
  }

  return data;
};

const fetchJson = async <T = any>(path: string, init: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init);
    return await parseJsonResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the server. Please make sure the backend is running.');
    }
    throw error;
  }
};

export async function postJson<T = any>(path: string, body: any): Promise<T> {
  return await fetchJson(path, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
}

export async function getJson<T = any>(path: string): Promise<T> {
  return await fetchJson(path, {
    method: 'GET',
    headers: buildHeaders(),
  });
}

export async function authPostJson<T = any>(path: string, body: any): Promise<T> {
  return await fetchJson(path, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function authPutJson<T = any>(path: string, body: any): Promise<T> {
  return await fetchJson(path, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
}

export async function authGetJson<T = any>(path: string): Promise<T> {
  return await fetchJson(path, {
    method: 'GET',
    headers: buildHeaders(true),
  });
}
