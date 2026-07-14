const BASE_URL = '/api';

function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async get<T = any>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
      throw new Error(err.detail || 'Network response was not ok');
    }
    return res.json();
  },

  async post<T = any>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
      throw new Error(err.detail || 'Network response was not ok');
    }
    return res.json();
  },

  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
      throw new Error(err.detail || 'Network response was not ok');
    }
    return res.json();
  },

  async delete<T = any>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
      throw new Error(err.detail || 'Network response was not ok');
    }
    return res.json();
  },

  async upload<T = any>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'File upload failed.' }));
      throw new Error(err.detail || 'Network response was not ok');
    }
    return res.json();
  }
};
export default api;
