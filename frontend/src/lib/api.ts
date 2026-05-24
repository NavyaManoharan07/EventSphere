export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function postJson<T = any>(path: string, body: any): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } else {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data?.message ?? response.statusText ?? 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the authentication server. Please make sure the backend is running.');
    }
    throw error;
  }
}

