export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function postJson<T = any>(path: string, body: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? response.statusText);
  }

  return data;
}
