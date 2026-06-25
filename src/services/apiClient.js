import { clearStoredSession, getStoredSession } from './sessionService.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

export async function apiRequest(path, options = {}) {
  const session = getStoredSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (response.status === 401) {
      if (session?.token) {
        clearStoredSession();
        window.location.assign('/login');
        throw new ApiError('Tu sesión expiró. Vuelve a iniciar sesión.', 401, payload);
      }
      throw new ApiError(
        payload?.message || 'El correo o la contraseña no son correctos.',
        401,
        payload
      );
    }

    if (!response.ok) {
      throw new ApiError(
        payload?.message || 'No pudimos completar la solicitud.',
        response.status,
        payload
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('No pudimos conectar con el servidor. Intenta nuevamente más tarde.', 0, error);
  }
}

export const apiClient = {
  get: (path) => apiRequest(path),
  post: (path, data) => apiRequest(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => apiRequest(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
  postForm: (path, formData) => apiRequest(path, { method: 'POST', body: formData }),
  putForm: (path, formData) => apiRequest(path, { method: 'PUT', body: formData })
};
