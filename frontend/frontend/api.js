/**
 * Single entry point for every call to the Django backend.
 *
 * Set EXPO_PUBLIC_API_URL in .env to point at your machine's LAN address when
 * testing on a phone (localhost resolves to the phone itself, not your laptop).
 */

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

// Mirrors backend/api/urls.py.
export const endpoints = {
  register: '/register/',
  login: '/login/',
  token: '/token/',
  tokenRefresh: '/token/refresh/',
  currentUser: '/current_user/',
  courses: '/courses/',
  children: '/children/',
  parentDashboard: '/parent-dashboard/',
  teacherDashboard: '/teacher-dashboard/',
  payEnrollment: (enrollmentId) => `/enrollments/${enrollmentId}/pay/`,
};

let accessToken = null;

export function setAuthToken(token) {
  accessToken = token;
}

export function getAuthToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : null),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : null),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(data?.detail ?? `Request failed (${response.status})`, response.status, data);
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export default api;
