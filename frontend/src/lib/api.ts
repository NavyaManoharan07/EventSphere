const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

export const API_BASE_URL = rawApiBaseUrl.endsWith('/api')
  ? rawApiBaseUrl
  : `${rawApiBaseUrl.replace(/\/$/, '')}/api`;

const getAuthToken = () => localStorage.getItem('token') ?? '';

const buildHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
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
