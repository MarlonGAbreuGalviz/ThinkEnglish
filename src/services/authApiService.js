import { apiClient } from './apiClient.js';
import { authenticateTestAccount } from '../data/testData.js';
import { isTestSession } from './sessionService.js';

export function login(credentials) {
  const testSession = authenticateTestAccount(credentials);
  if (testSession) return Promise.resolve(testSession);
  return apiClient.post('/auth/login', credentials);
}

export function registerUser(data) {
  return apiClient.post('/auth/register', data);
}

export function requestPasswordReset(email) {
  return apiClient.post('/auth/forgot-password', { email });
}

export function logout() {
  if (isTestSession()) return Promise.resolve({ ok: true });
  return apiClient.post('/auth/logout', {});
}
