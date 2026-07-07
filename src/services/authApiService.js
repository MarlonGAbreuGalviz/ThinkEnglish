import { apiClient } from './apiClient.js';

export function login(credentials) {
  return apiClient.post('/auth/login', credentials);
}

export function registerUser(data) {
  return apiClient.post('/auth/register', data);
}

export function requestPasswordReset(email) {
  return apiClient.post('/auth/forgot-password', { email });
}

export function logout() {
  return apiClient.post('/auth/logout', {});
}